/**
 * Types for the compiler package
 */

export interface TemplateMetadata {
  name: string;
  version: string;
  description: string;
  author?: string;
  framework: string;
  backend?: string;
  features: string[];
  variables: TemplateVariable[];
  files: TemplateFile[];
}

export interface TemplateVariable {
  name: string;
  type: 'string' | 'boolean' | 'number' | 'array' | 'object';
  description: string;
  required: boolean;
  default?: unknown;
}

export interface TemplateFile {
  path: string;
  template: string;
  condition?: string; // Expression to determine if file should be generated
}

export interface RenderContext {
  [key: string]: unknown;
}

export interface RenderedFile {
  path: string;
  content: string;
}

export interface CompilerOptions {
  generateReadme: boolean;
  generateCI: boolean;
  generateEnvExample: boolean;
}
