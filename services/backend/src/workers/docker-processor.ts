/**
 * Docker-based build processor
 * Handles actual code execution in isolated Docker containers
 */

import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { BuildJob, BuildResult, LogEntry, JobProgress } from '../types/job';
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

    try {
      // Phase 1: Prepare filesystem
      await this.updateProgress(job.jobId, 'preparing', 10, 'Preparing filesystem...');
      await this.prepareFilesystem(job);

      // Phase 2: Install dependencies
      await this.updateProgress(job.jobId, 'installing', 30, 'Installing dependencies...');
      await this.installDependencies(job);

      // Phase 3: Execute build
      await this.updateProgress(job.jobId, 'building', 60, 'Running build...');
      const buildOutput = await this.executeBuild(job);

      // Phase 4: Collect artifacts
      await this.updateProgress(job.jobId, 'completed', 90, 'Collecting artifacts...');
      const artifacts = await this.collectArtifacts(job);

      // Phase 5: Complete
      await this.updateProgress(job.jobId, 'completed', 100, 'Build completed successfully');

      const endTime = new Date().toISOString();
      return {
        jobId: job.jobId,
        status: 'success',
        logs: this.logs,
        artifacts,
        metrics: {
          startTime: this.startTime,
          endTime,
          duration: new Date(endTime).getTime() - new Date(this.startTime).getTime(),
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.addLog('error', errorMessage, 'system');

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