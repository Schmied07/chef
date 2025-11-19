import { z } from 'zod';

/**
 * Job types supported by the workers
 */
export enum JobType {
  BUILD = 'build',
  TEST = 'test',
  LINT = 'lint',
  ANALYZE = 'analyze',
}

/**
 * Job status throughout its lifecycle
 */
export enum JobStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  TIMEOUT = 'timeout',
}

/**
 * Job priority levels
 */
export enum JobPriority {
  LOW = 1,
  NORMAL = 5,
  HIGH = 10,
  CRITICAL = 20,
}

/**
 * Build job data schema
 */
export const buildJobDataSchema = z.object({
  chatId: z.string(),
  projectFiles: z.record(z.string(), z.string()), // filename -> content
  command: z.string().optional(),
  dependencies: z.record(z.string(), z.string()).optional(),
  env: z.record(z.string(), z.string()).optional(),
});

export type BuildJobData = z.infer<typeof buildJobDataSchema>;

/**
 * Test job data schema
 */
export const testJobDataSchema = z.object({
  chatId: z.string(),
  projectFiles: z.record(z.string(), z.string()),
  testCommand: z.string().default('npm test'),
  env: z.record(z.string(), z.string()).optional(),
});

export type TestJobData = z.infer<typeof testJobDataSchema>;

/**
 * Job result schema
 */
export const jobResultSchema = z.object({
  jobId: z.string(),
  status: z.nativeEnum(JobStatus),
  output: z.string().optional(),
  error: z.string().optional(),
  logs: z.array(z.string()).optional(),
  artifacts: z.record(z.string(), z.string()).optional(),
  duration: z.number().optional(), // in milliseconds
  timestamp: z.string(),
});

export type JobResult = z.infer<typeof jobResultSchema>;

/**
 * Worker configuration
 */
export interface WorkerConfig {
  memoryLimit: string;
  cpuLimit: number;
  timeout: number;
  networkIsolation: boolean;
}

/**
 * Queue configuration
 */
export interface QueueConfig {
  maxConcurrentJobs: number;
  defaultPriority: JobPriority;
  retryAttempts: number;
  retryDelay: number;
}
