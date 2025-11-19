import { z } from 'zod';

/**
 * Execution strategy type
 */
export enum ExecutionStrategy {
  WEBCONTAINER = 'webcontainer',
  DOCKER = 'docker',
  AUTO = 'auto'
}

/**
 * Build complexity level (0-100)
 * 0-30: Simple (WebContainer)
 * 31-70: Medium (WebContainer with caution)
 * 71-100: Heavy (Docker)
 */
export type ComplexityScore = number;

/**
 * Project file structure
 */
export interface ProjectFile {
  path: string;
  content: string;
  size?: number;
}

/**
 * Project dependencies
 */
export interface ProjectDependencies {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

/**
 * Build request
 */
export interface BuildRequest {
  chatId: string;
  files: ProjectFile[];
  dependencies?: ProjectDependencies;
  strategy?: ExecutionStrategy;
  priority?: number;
}

/**
 * Build result
 */
export interface BuildResult {
  buildId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  strategy: ExecutionStrategy;
  progress: number;
  logs?: string[];
  artifacts?: Record<string, string>;
  error?: string;
  createdAt: Date;
  finishedAt?: Date;
}

/**
 * Complexity analysis result
 */
export interface ComplexityAnalysis {
  score: ComplexityScore;
  recommendedStrategy: ExecutionStrategy;
  factors: {
    fileCount: number;
    totalSize: number;
    dependencyCount: number;
    hasHeavyDependencies: boolean;
    hasNativeDependencies: boolean;
    hasBuildStep: boolean;
  };
  reasoning: string;
}

/**
 * Workers API job creation request
 */
export interface WorkersJobRequest {
  type: 'build' | 'test' | 'lint' | 'analyze';
  priority: number;
  data: {
    chatId: string;
    projectFiles: Record<string, string>;
    dependencies?: ProjectDependencies;
    strategy?: ExecutionStrategy;
  };
}

/**
 * Workers API job response
 */
export interface WorkersJobResponse {
  jobId: string;
  type: string;
  status: string;
  progress?: number;
  createdAt: string;
  finishedAt?: string;
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Logger configuration
 */
export interface LoggerConfig {
  level?: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  pretty?: boolean;
}

/**
 * Engine configuration
 */
export interface EngineConfig {
  workersApiUrl: string;
  workersApiTimeout?: number;
  maxRetries?: number;
  retryDelay?: number;
  logger?: LoggerConfig;
}

// Zod schemas for validation
export const projectFileSchema = z.object({
  path: z.string().min(1),
  content: z.string(),
  size: z.number().optional(),
});

export const projectDependenciesSchema = z.object({
  dependencies: z.record(z.string()).optional(),
  devDependencies: z.record(z.string()).optional(),
  peerDependencies: z.record(z.string()).optional(),
});

export const buildRequestSchema = z.object({
  chatId: z.string().min(1),
  files: z.array(projectFileSchema).min(1),
  dependencies: projectDependenciesSchema.optional(),
  strategy: z.nativeEnum(ExecutionStrategy).optional(),
  priority: z.number().min(1).max(10).optional(),
});

export const engineConfigSchema = z.object({
  workersApiUrl: z.string().url(),
  workersApiTimeout: z.number().positive().optional(),
  maxRetries: z.number().min(0).max(10).optional(),
  retryDelay: z.number().positive().optional(),
  logger: z.object({
    level: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).optional(),
    pretty: z.boolean().optional(),
  }).optional(),
});