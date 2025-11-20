/**
 * Job types and interfaces
 */

export interface BuildJob {
  jobId: string;
  projectId: string;
  files: FileItem[];
  dependencies: Record<string, string>;
  executionMode: 'webcontainer' | 'docker';
  strategy: BuildStrategy;
  metadata: JobMetadata;
  priority?: JobPriority;
}

export type JobPriority = 'low' | 'normal' | 'high' | 'critical';

export interface FileItem {
  path: string;
  content: string;
  language?: string;
}

export interface BuildStrategy {
  runtime: 'node' | 'python' | 'web';
  version: string;
  installCommand?: string;
  buildCommand?: string;
  startCommand?: string;
}

export interface JobMetadata {
  userId?: string;
  timestamp: string;
  timeout?: number;
  env?: Record<string, string>;
}

export interface BuildResult {
  jobId: string;
  status: 'success' | 'failure';
  logs: LogEntry[];
  artifacts?: Artifact[];
  metrics: BuildMetrics;
  error?: string;
  testResults?: TestResults;
}

export interface TestResults {
  executed: boolean;
  passed: boolean;
  total: number;
  passed_count: number;
  failed_count: number;
  skipped_count: number;
  duration: number;
  output: string;
}

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'error' | 'warn' | 'debug';
  message: string;
  source: 'stdout' | 'stderr' | 'system';
}

export interface Artifact {
  name: string;
  path: string;
  size: number;
  type: string;
}

export interface BuildMetrics {
  startTime: string;
  endTime: string;
  duration: number;
  memoryUsed?: number;
  cpuUsed?: number;
}

export type JobStatus = 'queued' | 'preparing' | 'installing' | 'building' | 'completed' | 'failed';

export interface JobProgress {
  jobId: string;
  status: JobStatus;
  progress: number;
  message: string;
}