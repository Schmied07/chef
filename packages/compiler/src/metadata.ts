/**
 * Metadata parser and validator
 */

import type { TemplateMetadata } from './types';
import { z } from 'zod';

const TemplateVariableSchema = z.object({
  name: z.string(),
  type: z.enum(['string', 'boolean', 'number', 'array', 'object']),
  description: z.string(),
  required: z.boolean(),
  default: z.unknown().optional(),
});

const TemplateFileSchema = z.object({
  path: z.string(),
  template: z.string(),
  condition: z.string().optional(),
});

const TemplateMetadataSchema = z.object({
  name: z.string(),
  version: z.string(),
  description: z.string(),
  author: z.string().optional(),
  framework: z.string(),
  backend: z.string().optional(),
  features: z.array(z.string()),
  variables: z.array(TemplateVariableSchema),
  files: z.array(TemplateFileSchema),
});

/**
 * Parses and validates template metadata from JSON
 */
export function parseMetadata(json: string): TemplateMetadata {
  const data = JSON.parse(json);
  return TemplateMetadataSchema.parse(data);
}

/**
 * Validates template metadata
 */
export function validateMetadata(metadata: TemplateMetadata): boolean {
  try {
    TemplateMetadataSchema.parse(metadata);
    return true;
  } catch {
    return false;
  }
}
