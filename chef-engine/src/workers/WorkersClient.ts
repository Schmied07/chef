import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  WorkersJobRequest,
  WorkersJobResponse,
  BuildResult,
  ExecutionStrategy,
} from '../types/index.js';
import type { Logger } from '../utils/logger.js';
import { retryWithBackoff } from '../utils/retry.js';

/**
 * Workers API Client
 * Communicates with the workers service via HTTP
 */
export class WorkersClient {
  private client: AxiosInstance;
  private maxRetries: number;
  private retryDelay: number;

  constructor(
    private baseUrl: string,
    private logger?: Logger,
    options: {
      timeout?: number;
      maxRetries?: number;
      retryDelay?: number;
    } = {}
  ) {
    this.maxRetries = options.maxRetries ?? 3;
    this.retryDelay = options.retryDelay ?? 1000;

    this.client = axios.create({
      baseURL: baseUrl,
      timeout: options.timeout ?? 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Setup axios interceptors for logging
   */
  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      (config) => {
        this.logger?.debug(
          { method: config.method, url: config.url },
          'Making request to workers API'
        );
        return config;
      },
      (error) => {
        this.logger?.error({ error }, 'Request interceptor error');
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        this.logger?.debug(
          { status: response.status, url: response.config.url },
          'Received response from workers API'
        );
        return response;
      },
      (error: AxiosError) => {
        this.logger?.error(
          {
            status: error.response?.status,
            message: error.message,
            url: error.config?.url,
          },
          'Response error from workers API'
        );
        return Promise.reject(error);
      }
    );
  }

  /**
   * Check workers service health
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await retryWithBackoff(
        () => this.client.get('/api/health'),
        {
          maxRetries: this.maxRetries,
          initialDelay: this.retryDelay,
          logger: this.logger,
          operation: 'health check',
        }
      );
      return response.data.status === 'healthy';
    } catch (error) {
      this.logger?.error({ error }, 'Workers service health check failed');
      return false;
    }
  }

  /**
   * Create a new job
   */
  async createJob(
    chatId: string,
    files: Record<string, string>,
    options: {
      dependencies?: any;
      strategy?: ExecutionStrategy;
      priority?: number;
      type?: 'build' | 'test' | 'lint' | 'analyze';
    } = {}
  ): Promise<WorkersJobResponse> {
    const jobRequest: WorkersJobRequest = {
      type: options.type || 'build',
      priority: options.priority || 5,
      data: {
        chatId,
        projectFiles: files,
        dependencies: options.dependencies,
        strategy: options.strategy,
      },
    };

    this.logger?.info(
      { chatId, fileCount: Object.keys(files).length, type: jobRequest.type },
      'Creating job'
    );

    try {
      const response = await retryWithBackoff(
        () => this.client.post<WorkersJobResponse>('/api/jobs', jobRequest),
        {
          maxRetries: this.maxRetries,
          initialDelay: this.retryDelay,
          logger: this.logger,
          operation: 'create job',
        }
      );

      this.logger?.info({ jobId: response.data.jobId }, 'Job created successfully');
      return response.data;
    } catch (error) {
      this.logger?.error({ error, chatId }, 'Failed to create job');
      throw this.handleError(error);
    }
  }

  /**
   * Get job status
   */
  async getJobStatus(jobId: string): Promise<WorkersJobResponse> {
    try {
      const response = await retryWithBackoff(
        () => this.client.get<WorkersJobResponse>(`/api/jobs/${jobId}`),
        {
          maxRetries: this.maxRetries,
          initialDelay: this.retryDelay,
          logger: this.logger,
          operation: 'get job status',
        }
      );
      return response.data;
    } catch (error) {
      this.logger?.error({ error, jobId }, 'Failed to get job status');
      throw this.handleError(error);
    }
  }

  /**
   * Poll job status until completion
   */
  async waitForJobCompletion(
    jobId: string,
    options: {
      pollInterval?: number;
      timeout?: number;
      onProgress?: (progress: number) => void;
    } = {}
  ): Promise<BuildResult> {
    const pollInterval = options.pollInterval ?? 2000;
    const timeout = options.timeout ?? 300000; // 5 minutes
    const startTime = Date.now();

    this.logger?.info({ jobId, pollInterval, timeout }, 'Waiting for job completion');

    while (true) {
      // Check timeout
      if (Date.now() - startTime > timeout) {
        const error = new Error(`Job ${jobId} timed out after ${timeout}ms`);
        this.logger?.error({ jobId, timeout }, 'Job timed out');
        throw error;
      }

      // Get job status
      const status = await this.getJobStatus(jobId);

      // Call progress callback
      if (options.onProgress && status.progress !== undefined) {
        options.onProgress(status.progress);
      }

      // Check if job is complete
      if (status.status === 'completed' || status.status === 'failed') {
        this.logger?.info(
          { jobId, status: status.status, duration: Date.now() - startTime },
          'Job completed'
        );

        return {
          buildId: status.jobId,
          status: status.status as any,
          strategy: ExecutionStrategy.DOCKER, // TODO: Get from response
          progress: status.progress || (status.status === 'completed' ? 100 : 0),
          createdAt: new Date(status.createdAt),
          finishedAt: status.finishedAt ? new Date(status.finishedAt) : undefined,
        };
      }

      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
  }

  /**
   * Get queue statistics
   */
  async getStats(): Promise<any> {
    try {
      const response = await this.client.get('/api/stats');
      return response.data;
    } catch (error) {
      this.logger?.error({ error }, 'Failed to get queue stats');
      throw this.handleError(error);
    }
  }

  /**
   * Handle and format errors
   */
  private handleError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message;
      const status = error.response?.status;
      return new Error(`Workers API error (${status}): ${message}`);
    }
    return error as Error;
  }
}