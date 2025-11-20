/**
 * Docker-based build processor
 * Handles actual code execution in isolated Docker containers
 */

import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { BuildJob, BuildResult, LogEntry, JobProgress, TestResults } from '../types/job';
import { logger } from '../utils/logger';
import { metrics } from '../utils/metrics';
import { config } from '../config';
import {
  getDockerClient,
  getDockerImage,
  ensureImage,
  createContainer,
  executeInContainer,
  killContainer,
} from '../services/docker';

export class DockerProcessor {
  private logs: LogEntry[] = [];
  private startTime: string = '';
  private buildDir: string = '';
  private containerId?: string;

  async process(job: BuildJob): Promise<BuildResult> {
    this.startTime = new Date().toISOString();
    this.buildDir = path.join(config.build.dir, job.jobId);

    // Start metrics tracking
    metrics.startJob(job.jobId);

    try {
      // Phase 1: Prepare filesystem
      await this.updateProgress(job.jobId, 'preparing', 10, 'Preparing filesystem...');
      metrics.updatePhase(job.jobId, 'preparing');
      await this.prepareFilesystem(job);

      // Phase 2: Install dependencies
      await this.updateProgress(job.jobId, 'installing', 30, 'Installing dependencies...');
      await this.installDependencies(job);

      // Phase 3: Execute build
      await this.updateProgress(job.jobId, 'building', 50, 'Running build...');
      const buildOutput = await this.executeBuild(job);

      // Phase 3.5: Run tests (if tests exist)
      await this.updateProgress(job.jobId, 'building', 70, 'Running tests...');
      const testResults = await this.executeTests(job);

      // Phase 4: Collect artifacts
      await this.updateProgress(job.jobId, 'completed', 90, 'Collecting artifacts...');
      const artifacts = await this.collectArtifacts(job);

      // Phase 5: Complete
      await this.updateProgress(job.jobId, 'completed', 100, 'Build completed successfully');
      metrics.updatePhase(job.jobId, 'completed');

      const endTime = new Date().toISOString();
      const duration = new Date(endTime).getTime() - new Date(this.startTime).getTime();

      // Complete metrics tracking
      metrics.completeJob(job.jobId, 'success');

      return {
        jobId: job.jobId,
        status: 'success',
        logs: this.logs,
        artifacts,
        testResults,
        metrics: {
          startTime: this.startTime,
          endTime,
          duration,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.addLog('error', errorMessage, 'system');

      // Complete metrics with failure
      metrics.completeJob(job.jobId, 'failure');

      return {
        jobId: job.jobId,
        status: 'failure',
        logs: this.logs,
        metrics: {
          startTime: this.startTime,
          endTime: new Date().toISOString(),
          duration: Date.now() - new Date(this.startTime).getTime(),
        },
        error: errorMessage,
      };
    } finally {
      // Cleanup
      await this.cleanup();
    }
  }

  /**
   * Phase 1: Prepare filesystem
   */
  private async prepareFilesystem(job: BuildJob): Promise<void> {
    this.addLog('info', `Creating build directory: ${this.buildDir}`, 'system');

    // Create build directory
    await fs.mkdir(this.buildDir, { recursive: true });

    // Write all files
    for (const file of job.files) {
      const filePath = path.join(this.buildDir, file.path);
      const fileDir = path.dirname(filePath);

      await fs.mkdir(fileDir, { recursive: true });
      await fs.writeFile(filePath, file.content, 'utf8');

      this.addLog('info', `Created file: ${file.path}`, 'system');
    }

    // Create package.json if needed
    if (job.strategy.runtime === 'node' && Object.keys(job.dependencies).length > 0) {
      const packageJson = {
        name: `chef-build-${job.jobId}`,
        version: '1.0.0',
        dependencies: job.dependencies,
      };
      await fs.writeFile(
        path.join(this.buildDir, 'package.json'),
        JSON.stringify(packageJson, null, 2),
        'utf8'
      );
      this.addLog('info', 'Created package.json', 'system');
    }

    this.addLog('info', 'Filesystem preparation complete', 'system');
  }

  /**
   * Phase 2: Install dependencies
   */
  private async installDependencies(job: BuildJob): Promise<void> {
    if (!job.strategy.installCommand) {
      this.addLog('info', 'No install command specified, skipping...', 'system');
      return;
    }

    const image = getDockerImage(job.strategy);
    await ensureImage(image);

    const container = await createContainer({
      image,
      cmd: ['/bin/sh', '-c', job.strategy.installCommand],
      binds: [`${this.buildDir}:/workspace`],
      workingDir: '/workspace',
      env: this.buildEnvVars(job),
    });

    this.containerId = container.id;

    const result = await executeInContainer(container, (log) => {
      this.logs.push(log as LogEntry);
    });

    if (result.exitCode !== 0) {
      throw new Error(`Dependency installation failed with exit code ${result.exitCode}`);
    }

    this.addLog('info', 'Dependencies installed successfully', 'system');
  }

  /**
   * Phase 3: Execute build
   */
  private async executeBuild(job: BuildJob): Promise<string> {
    if (!job.strategy.buildCommand) {
      this.addLog('info', 'No build command specified, skipping...', 'system');
      return '';
    }

    const image = getDockerImage(job.strategy);
    await ensureImage(image);

    const container = await createContainer({
      image,
      cmd: ['/bin/sh', '-c', job.strategy.buildCommand],
      binds: [`${this.buildDir}:/workspace`],
      workingDir: '/workspace',
      env: this.buildEnvVars(job),
    });

    this.containerId = container.id;

    // Set timeout
    const timeout = job.metadata.timeout || config.worker.timeout;
    const timeoutHandle = setTimeout(() => {
      if (this.containerId) {
        killContainer(this.containerId, 5);
        this.addLog('error', `Build timeout after ${timeout}ms`, 'system');
      }
    }, timeout);

    try {
      const result = await executeInContainer(container, (log) => {
        this.logs.push(log as LogEntry);
      });

      clearTimeout(timeoutHandle);

      if (result.exitCode !== 0) {
        throw new Error(`Build failed with exit code ${result.exitCode}`);
      }

      this.addLog('info', 'Build completed successfully', 'system');
      return result.output;
    } catch (error) {
      clearTimeout(timeoutHandle);
      throw error;
    }
  }

  /**
   * Phase 3.5: Execute tests
   */
  private async executeTests(job: BuildJob): Promise<TestResults | undefined> {
    // Check if tests exist
    const hasTests = await this.checkForTests();
    
    if (!hasTests) {
      this.addLog('info', 'No tests found, skipping test execution', 'system');
      return undefined;
    }

    // Determine test command based on package.json or strategy
    const testCommand = job.strategy.runtime === 'node' 
      ? 'npm test -- --passWithNoTests || npm run test || yarn test || true'
      : job.strategy.runtime === 'python'
      ? 'pytest || python -m pytest || true'
      : null;

    if (!testCommand) {
      this.addLog('info', 'No test command available for runtime', 'system');
      return undefined;
    }

    const image = getDockerImage(job.strategy);
    await ensureImage(image);

    const container = await createContainer({
      image,
      cmd: ['/bin/sh', '-c', testCommand],
      binds: [`${this.buildDir}:/workspace`],
      workingDir: '/workspace',
      env: this.buildEnvVars(job),
    });

    this.containerId = container.id;

    const testStartTime = Date.now();
    let testOutput = '';

    try {
      const result = await executeInContainer(container, (log) => {
        testOutput += log.message + '\n';
        this.logs.push(log as LogEntry);
      });

      const testDuration = Date.now() - testStartTime;

      // Parse test results from output
      const testResults = this.parseTestResults(testOutput, result.exitCode === 0, testDuration);

      if (testResults.passed) {
        this.addLog('info', `✅ Tests passed: ${testResults.passed_count}/${testResults.total}`, 'system');
      } else {
        this.addLog('warn', `⚠️ Tests failed: ${testResults.failed_count}/${testResults.total}`, 'system');
      }

      return testResults;
    } catch (error) {
      this.addLog('warn', `Test execution error: ${error instanceof Error ? error.message : 'Unknown'}`, 'system');
      return {
        executed: true,
        passed: false,
        total: 0,
        passed_count: 0,
        failed_count: 0,
        skipped_count: 0,
        duration: Date.now() - testStartTime,
        output: testOutput,
      };
    }
  }

  /**
   * Check if project has tests
   */
  private async checkForTests(): Promise<boolean> {
    const testPaths = [
      'test',
      '__tests__',
      'tests',
      'spec',
    ];

    for (const testPath of testPaths) {
      try {
        const fullPath = path.join(this.buildDir, testPath);
        await fs.access(fullPath);
        return true;
      } catch {
        // Continue checking
      }
    }

    // Check for test files in root
    try {
      const files = await fs.readdir(this.buildDir);
      const hasTestFiles = files.some(file => 
        file.includes('.test.') || 
        file.includes('.spec.') ||
        file.includes('_test.')
      );
      return hasTestFiles;
    } catch {
      return false;
    }
  }

  /**
   * Parse test results from output
   */
  private parseTestResults(output: string, passed: boolean, duration: number): TestResults {
    // Try to parse Jest output
    const jestMatch = output.match(/Tests:\s+(\d+)\s+passed.*?(\d+)\s+total/);
    if (jestMatch) {
      const passed_count = parseInt(jestMatch[1]);
      const total = parseInt(jestMatch[2]);
      return {
        executed: true,
        passed: passed_count === total,
        total,
        passed_count,
        failed_count: total - passed_count,
        skipped_count: 0,
        duration,
        output,
      };
    }

    // Try to parse Pytest output
    const pytestMatch = output.match(/(\d+)\s+passed/);
    if (pytestMatch) {
      const passed_count = parseInt(pytestMatch[1]);
      const failedMatch = output.match(/(\d+)\s+failed/);
      const failed_count = failedMatch ? parseInt(failedMatch[1]) : 0;
      const total = passed_count + failed_count;
      
      return {
        executed: true,
        passed: failed_count === 0,
        total,
        passed_count,
        failed_count,
        skipped_count: 0,
        duration,
        output,
      };
    }

    // Default result
    return {
      executed: true,
      passed,
      total: 0,
      passed_count: 0,
      failed_count: 0,
      skipped_count: 0,
      duration,
      output,
    };
  }

  /**
   * Phase 4: Collect artifacts
   */
  private async collectArtifacts(job: BuildJob) {
    const artifacts = [];
    const artifactsDir = path.join(config.build.artifactsDir, job.jobId);

    await fs.mkdir(artifactsDir, { recursive: true });

    // Common artifact directories
    const artifactPaths = ['dist', 'build', 'out', '.next', 'public'];

    for (const artifactPath of artifactPaths) {
      const fullPath = path.join(this.buildDir, artifactPath);

      try {
        const stats = await fs.stat(fullPath);
        if (stats.isDirectory()) {
          // Copy artifacts
          await this.copyDirectory(fullPath, path.join(artifactsDir, artifactPath));

          artifacts.push({
            name: artifactPath,
            path: path.join(artifactsDir, artifactPath),
            size: stats.size,
            type: 'directory',
          });

          this.addLog('info', `Collected artifact: ${artifactPath}`, 'system');
        }
      } catch (error) {
        // Artifact doesn't exist, skip
      }
    }

    return artifacts;
  }

  /**
   * Cleanup resources
   */
  private async cleanup(): Promise<void> {
    try {
      // Kill container if still running
      if (this.containerId) {
        await killContainer(this.containerId);
      }

      // Remove build directory (optional, can keep for debugging)
      // await fs.rm(this.buildDir, { recursive: true, force: true });

      this.addLog('info', 'Cleanup completed', 'system');
    } catch (error) {
      logger.error('Cleanup error:', error);
    }
  }

  // Helper methods
  private addLog(level: 'info' | 'error' | 'warn', message: string, source: 'stdout' | 'stderr' | 'system'): void {
    this.logs.push({
      timestamp: new Date().toISOString(),
      level,
      message,
      source,
    });
  }

  private buildEnvVars(job: BuildJob): string[] {
    const env = ['NODE_ENV=production', 'CI=true'];

    if (job.metadata.env) {
      for (const [key, value] of Object.entries(job.metadata.env)) {
        env.push(`${key}=${value}`);
      }
    }

    return env;
  }

  private async copyDirectory(src: string, dest: string): Promise<void> {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        await this.copyDirectory(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  }

  private async updateProgress(
    jobId: string,
    status: JobProgress['status'],
    progress: number,
    message: string
  ): Promise<void> {
    this.addLog('info', message, 'system');
    // TODO: Update Redis with progress
    // await updateJobProgress(jobId, { status, progress, message });
  }
}

export async function processBuildJob(job: BuildJob): Promise<BuildResult> {
  const processor = new DockerProcessor();
  return await processor.process(job);
}