/**
 * Template Metadata Types
 * Sprint 5.2 - Metadata Templates
 */

export interface TemplateMetadata {
  version: string;
  name: string;
  description: string;
  author?: string;
  license?: string;
  variables: Record<string, TemplateVariable>;
  conditionalFiles: ConditionalFile[];
  dependencies: TemplateDependencies;
  scripts: Record<string, string>;
  features: TemplateFeature[];
}

export interface TemplateVariable {
  name: string;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'array';
  default: any;
  required: boolean;
  options?: string[]; // For select type
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    message?: string;
  };
}

export interface ConditionalFile {
  path: string;
  condition: string; // JavaScript expression: "{{auth}} === true"
  template: string;
}

export interface TemplateDependencies {
  required: Record<string, string>;
  optional: Record<string, { version: string; condition: string }>;
  devDependencies: Record<string, string>;
}

export interface TemplateFeature {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  files?: string[];
  dependencies?: string[];
}

export interface TemplateFile {
  path: string;
  content: string;
  encoding?: 'utf-8' | 'base64';
  executable?: boolean;
}

export interface GeneratedProject {
  name: string;
  template: string;
  files: TemplateFile[];
  metadata: TemplateMetadata;
  readme: string;
  envExample: string;
}

export interface TemplateConfig {
  projectName: string;
  variables: Record<string, any>;
  features: string[]; // IDs of enabled features
  customizations?: Record<string, any>;
}
