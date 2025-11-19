import type {
  BuildRequest,
  BuildResult,
  EngineConfig,
  ComplexityAnalysis,
  ValidationResult,
} from '../types/index.js';
import { buildRequestSchema } from '../types/index.js';
import { FileSystemManager } from '../filesystem/FileSystemManager.js';
import { DependencyResolver } from '../dependencies/DependencyResolver.js';
import { ManifestBuilder } from '../dependencies/ManifestBuilder.js';
import { ExecutionStrategySelector } from './ExecutionStrategy.js';
import { JobCreator } from './JobCreator.js';
import { WorkersClient } from '../workers/WorkersClient.js';
import { createLogger, type Logger } from '../utils/logger.js';

/**
 * Build Engine
 * Main orchestrator for the Chef build system
 * 
 * Flow:
 * 1. Validate and prepare files
 * 2. Analyze complexity and decide execution strategy
 * 3. Create build job via workers service
 * 4. Monitor job progress
 * 5. Return results
 */
export class BuildEngine {
  private fileSystemManager: FileSystemManager;
  private dependencyResolver: DependencyResolver;
  private manifestBuilder: ManifestBuilder;
  private strategySelector: ExecutionStrategySelector;
  private jobCreator: JobCreator;
  private workersClient: WorkersClient;
  private logger: Logger;

  constructor(config: EngineConfig) {
    // Initialize logger
    this.logger = createLogger(config.logger);

    // Initialize workers client
    this.workersClient = new WorkersClient(
      config.workersApiUrl,
      this.logger,
      {
        timeout: config.workersApiTimeout,
        maxRetries: config.maxRetries,
        retryDelay: config.retryDelay,
      }
    );

    // Initialize managers
    this.fileSystemManager = new FileSystemManager(this.logger);
    this.dependencyResolver = new DependencyResolver(this.logger);
    this.manifestBuilder = new ManifestBuilder(this.logger);
    this.strategySelector = new ExecutionStrategySelector(this.logger);
    this.jobCreator = new JobCreator(this.workersClient, this.logger);

    this.logger.info({ workersApiUrl: config.workersApiUrl }, 'BuildEngine initialized');
  }

  /**
   * Create a new build
   * Main entry point for build creation
   */
  async createBuild(request: BuildRequest): Promise<{
    buildId: string;
    status: BuildResult['status'];
    strategy: string;
    complexity: ComplexityAnalysis;
  }> {
    this.logger.info(
      { chatId: request.chatId, fileCount: request.files.length },
      'Creating build'
    );

    // Step 1: Validate request
    const validation = this.validateRequest(request);
    if (!validation.valid) {
      throw new Error(`Invalid build request: ${validation.errors.join(', ')}`);
    }

    // Step 2: Prepare files
    const { files, validation: fileValidation, metadata } = await this.fileSystemManager.prepareFiles(
      request.files
    );

    if (!fileValidation.valid) {
      throw new Error(`Invalid files: ${fileValidation.errors.join(', ')}`);
    }

    // Log warnings
    if (fileValidation.warnings.length > 0) {
      this.logger.warn({ warnings: fileValidation.warnings }, 'File validation warnings');
    }

    // Step 3: Resolve dependencies
    const dependencies = request.dependencies || this.dependencyResolver.resolveDependencies(files);

    // Step 4: Analyze complexity and decide strategy
    const { strategy, analysis } = this.strategySelector.decideStrategy(
      files,
      dependencies || undefined,
      request.strategy
    );

    this.logger.info(
      {
        strategy,
        complexity: analysis.score,
        reasoning: analysis.reasoning,
      },
      'Execution strategy decided'
    );

    // Step 5: Build/update manifest if needed
    if (metadata.hasPackageJson) {
      this.logger.debug('Using existing package.json');
    } else {
      this.logger.warn('No package.json found, creating default manifest');
      const manifest = this.manifestBuilder.buildManifest(files, dependencies || undefined);
      files.push({ path: 'package.json', content: manifest });
    }

    // Step 6: Create build job
    const { jobId } = await this.jobCreator.createBuildJob(
      {
        ...request,
        files,
        dependencies: dependencies || undefined,
      },
      strategy
    );

    this.logger.info(
      { buildId: jobId, strategy, complexity: analysis.score },
      'Build created successfully'
    );

    return {
      buildId: jobId,
      status: 'pending',
      strategy,
      complexity: analysis,
    };
  }

  /**
   * Get build status
   */
  async getBuildStatus(buildId: string): Promise<BuildResult> {
    this.logger.debug({ buildId }, 'Getting build status');
    return await this.jobCreator.getBuildJobStatus(buildId);
  }

  /**
   * Wait for build to complete
   */
  async waitForBuild(
    buildId: string,
    options: {
      timeout?: number;
      onProgress?: (progress: number) => void;
    } = {}
  ): Promise<BuildResult> {
    this.logger.info({ buildId }, 'Waiting for build to complete');
    return await this.jobCreator.waitForBuildCompletion(buildId, options);
  }

  /**
   * Cancel a build
   */
  async cancelBuild(buildId: string): Promise<void> {
    this.logger.warn({ buildId }, 'Cancelling build');
    await this.jobCreator.cancelBuildJob(buildId);
  }

  /**
   * Estimate build complexity without creating a build
   */
  estimateBuildComplexity(
    files: BuildRequest['files'],
    dependencies?: BuildRequest['dependencies']
  ): ComplexityAnalysis {
    this.logger.debug('Estimating build complexity');
    return this.strategySelector.analyzeComplexity(files, dependencies);
  }

  /**
   * Validate build request
   */
  private validateRequest(request: BuildRequest): ValidationResult {
    try {
      buildRequestSchema.parse(request);
      return { valid: true, errors: [], warnings: [] };
    } catch (error: any) {
      const errors = error.errors?.map((e: any) => `${e.path.join('.')}: ${e.message}`) || [
        error.message,
      ];
      return { valid: false, errors, warnings: [] };
    }
  }

  /**
   * Check if workers service is healthy
   */
  async checkHealth(): Promise<boolean> {
    this.logger.debug('Checking workers service health');
    return await this.workersClient.checkHealth();
  }

  /**
   * Get workers queue statistics
   */
  async getStats(): Promise<any> {
    this.logger.debug('Getting workers statistics');
    return await this.workersClient.getStats();
  }
}