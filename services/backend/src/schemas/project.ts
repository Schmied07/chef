/**
 * Project validation schemas
 */

import { z } from 'zod';
import { uuidSchema, filePathSchema, fileContentSchema, safeStringSchema } from './common';

/**
 * File object schema
 */
export const fileSchema = z.object({
  path: filePathSchema,
  content: fileContentSchema,
  language: z
    .enum(['javascript', 'typescript', 'html', 'css', 'json', 'markdown', 'python', 'text'])
    .optional(),
});

/**
 * Dependencies schema
 */
export const dependenciesSchema = z.record(
  z.string().regex(/^[a-zA-Z0-9@/_-]+$/, 'Invalid package name'),
  z.string().regex(/^[0-9.^~*>=<-]+$/, 'Invalid version format')
);

/**
 * Build strategy schema
 */
export const buildStrategySchema = z.object({
  runtime: z.enum(['node', 'python', 'bun', 'deno']).default('node'),
  version: z.string().regex(/^\d+$/, 'Invalid version').default('18'),
  installCommand: z.string().max(500).default('npm install'),
  buildCommand: z.string().max(500).default('npm run build'),
  outputDir: z.string().max(255).default('dist'),
});

/**
 * Project metadata schema
 */
export const projectMetadataSchema = z.object({
  name: safeStringSchema.max(255).optional(),
  description: safeStringSchema.max(1000).optional(),
  author: safeStringSchema.max(255).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
  timestamp: z.string().datetime().optional(),
}).passthrough(); // Allow additional fields

/**
 * Create project schema
 */
export const createProjectSchema = z.object({
  files: z.array(fileSchema).min(1, 'At least one file is required').max(100, 'Too many files'),
  dependencies: dependenciesSchema.optional(),
  strategy: buildStrategySchema.optional(),
  metadata: projectMetadataSchema.optional(),
});

/**
 * Get project params schema
 */
export const getProjectParamsSchema = z.object({
  id: uuidSchema,
});

/**
 * Project status query schema
 */
export const projectStatusQuerySchema = z.object({
  includeArtifacts: z.coerce.boolean().optional(),
  includeLogs: z.coerce.boolean().optional(),
});
