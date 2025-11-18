/**
 * Template types
 */

export interface Template {
  id: string;
  name: string;
  description: string;
  category: 'fullstack' | 'frontend' | 'backend';
  techStack: string[];
  features: string[];
  metadata: TemplateMetadata;
}

export interface TemplateMetadata {
  framework: string;
  backend?: string;
  database?: string;
  auth?: boolean;
  styling?: string;
}

export const TEMPLATES: Record<string, Template> = {};
