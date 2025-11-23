/**
 * Common validation schemas
 */

import { z } from 'zod';

/**
 * UUID validation
 */
export const uuidSchema = z.string().uuid('Invalid UUID format');

/**
 * File name validation
 * - No path traversal
 * - No special characters except . - _
 * - Max 255 characters
 */
export const fileNameSchema = z
  .string()
  .min(1, 'File name is required')
  .max(255, 'File name too long')
  .regex(/^[a-zA-Z0-9._-]+$/, 'Invalid file name characters')
  .refine((name) => !name.includes('..'), 'Path traversal not allowed')
  .refine((name) => !name.startsWith('/'), 'Absolute paths not allowed');

/**
 * File path validation
 * - Relative paths only
 * - No path traversal
 * - Max 1024 characters
 */
export const filePathSchema = z
  .string()
  .min(1, 'File path is required')
  .max(1024, 'File path too long')
  .regex(/^[a-zA-Z0-9./_-]+$/, 'Invalid file path characters')
  .refine((path) => !path.includes('..'), 'Path traversal not allowed')
  .refine((path) => !path.startsWith('/'), 'Absolute paths not allowed')
  .refine((path) => path.startsWith('/') || path.startsWith('./'), 'Path must be relative');

/**
 * File content validation
 * - Max 10MB
 */
export const fileContentSchema = z
  .string()
  .max(10 * 1024 * 1024, 'File content too large (max 10MB)');

/**
 * URL validation (for webhooks, etc)
 */
export const urlSchema = z
  .string()
  .url('Invalid URL format')
  .refine(
    (url) => url.startsWith('http://') || url.startsWith('https://'),
    'Only HTTP/HTTPS URLs allowed'
  );

/**
 * Safe string validation base (without max length)
 * - No HTML/script tags
 */
const baseSafeStringValidation = (str: string) => !/<script|<iframe|javascript:/i.test(str);

/**
 * Safe string schema with configurable max length
 * Use this as a base to create safe strings with custom max lengths
 */
export const createSafeStringSchema = (maxLength: number = 10000) =>
  z
    .string()
    .max(maxLength, `String too long (max ${maxLength} characters)`)
    .refine(baseSafeStringValidation, 'Potentially unsafe content detected');

/**
 * Default safe string schema with 10000 character limit
 */
export const safeStringSchema = createSafeStringSchema(10000);

/**
 * Pagination schema
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
