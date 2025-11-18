/**
 * Core types for the Chef engine
 */

export interface UserPrompt {
  text: string;
  context?: Record<string, unknown>;
  timestamp: Date;
}

export interface ExtractedIntent {
  purpose: string;
  features: string[];
  techStack?: string[];
  constraints?: string[];
}

export interface GenerationPlan {
  steps: PlanStep[];
  estimatedTime?: number;
  dependencies: string[];
}

export interface PlanStep {
  id: string;
  type: 'scaffold' | 'component' | 'api' | 'database' | 'test' | 'config';
  description: string;
  dependencies: string[];
  files: string[];
}

export interface GeneratedCode {
  files: GeneratedFile[];
  dependencies: Record<string, string>;
  metadata: CodeMetadata;
}

export interface GeneratedFile {
  path: string;
  content: string;
  language: string;
}

export interface CodeMetadata {
  framework: string;
  template: string;
  features: string[];
  createdAt: Date;
}

export interface AnalysisResult {
  errors: CodeError[];
  warnings: CodeWarning[];
  suggestions: string[];
  score: number;
}

export interface CodeError {
  file: string;
  line: number;
  message: string;
  severity: 'error' | 'warning';
}

export interface CodeWarning {
  file: string;
  line: number;
  message: string;
  suggestion?: string;
}

export interface GeneratedTests {
  files: GeneratedFile[];
  coverage: number;
}

export interface ExecutionResult {
  success: boolean;
  output?: string;
  error?: string;
  logs: string[];
}

export interface PipelineConfig {
  enableAnalysis: boolean;
  enableTests: boolean;
  enableExecution: boolean;
  model?: string;
}
