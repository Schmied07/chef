import type {
  BuildRequest,
  BuildResult,
  ProjectFile,
} from '../types/index.js';
import { ExecutionStrategy } from '../types/index.js';
import { WorkersClient } from '../workers/WorkersClient.js';
import { FileUtils } from '../filesystem/FileUtils.js';
import type { Logger } from '../utils/logger.js';

/**
 * Job Creator
 * Creates and manages jobs with the workers service
 */
export class JobCreator {
  constructor(
    private workersClient: WorkersClient,
    private logger?: Logger
  ) {}

  /**
   * Create a build job
   */
  async createBuildJob(
    request: BuildRequest,
    strategy: ExecutionStrategy
  ): Promise<{ jobId: string; strategy: ExecutionStrategy }> {
    this.logger?.info(
      { chatId: request.chatId, strategy, fileCount: request.files.length },
      'Creating build job'
    );

    // Convert files array to map
    const filesMap = FileUtils.filesToMap(request.files);

    // Create job via workers API
    const response = await this.workersClient.createJob(
      request.chatId,
      filesMap,
      {
        dependencies: request.dependencies,
        strategy,
        priority: request.priority || 5,
        type: 'build',
      }
    );

    this.logger?.info({ jobId: response.jobId }, 'Build job created');

    return {
      jobId: response.jobId,
      strategy,
    };
  }

  /**
   * Get build job status
   */
  async getBuildJobStatus(jobId: string): Promise<BuildResult> {
    this.logger?.debug({ jobId }, 'Getting build job status');

    const status = await this.workersClient.getJobStatus(jobId);

    return {
      buildId: status.jobId,
      status: status.status as any,
      strategy: ExecutionStrategy.DOCKER, // TODO: Get from job metadata
      progress: status.progress || 0,
      createdAt: new Date(status.createdAt),
      finishedAt: status.finishedAt ? new Date(status.finishedAt) : undefined,
    };
  }

  /**
   * Wait for build job to complete
   */
  async waitForBuildCompletion(
    jobId: string,
    options: {
      timeout?: number;
      onProgress?: (progress: number) => void;
    } = {}
  ): Promise<BuildResult> {
    this.logger?.info({ jobId }, 'Waiting for build completion');

    return await this.workersClient.waitForJobCompletion(jobId, {
      timeout: options.timeout,
      onProgress: options.onProgress,
    });
  }

  /**
   * Cancel a build job
   * Note: This is a placeholder - actual cancellation logic depends on workers implementation
   */
  async cancelBuildJob(jobId: string): Promise<void> {
    this.logger?.warn({ jobId }, 'Build job cancellation requested (not yet implemented)');
    // TODO: Implement cancellation API in workers service
    throw new Error('Job cancellation not yet implemented');
  }
}