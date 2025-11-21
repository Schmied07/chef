/**
 * AI Generation validation schemas
 */

import { z } from 'zod';
import { buildStrategySchema, safeStringSchema } from './project';

/**
 * AI generation config schema
 */
export const aiConfigSchema = z.object({
  enableAnalysis: z.boolean().default(true),
  enableTests: z.boolean().default(false),
  enableDocs: z.boolean().default(false),
  model: z.string().max(100).optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().int().min(100).max(100000).optional(),
});

/**
 * Generate project schema
 */
export const generateProjectSchema = z.object({
  prompt: safeStringSchema
    .min(10, 'Prompt too short (min 10 characters)')
    .max(5000, 'Prompt too long (max 5000 characters)'),
  config: aiConfigSchema.optional(),
  strategy: buildStrategySchema.optional(),
});
