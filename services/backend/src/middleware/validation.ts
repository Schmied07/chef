/**
 * Validation middleware using Zod schemas
 * Validates request body, params, and query
 */

import type { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { logger } from '../utils/logger';

type ValidationTarget = 'body' | 'params' | 'query';

/**
 * Creates validation middleware for a given Zod schema
 */
export function validate(
  schema: ZodSchema,
  target: ValidationTarget = 'body'
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req[target];
      const validated = await schema.parseAsync(data);
      req[target] = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        logger.warn('Validation failed:', {
          target,
          errors: error.errors,
          path: req.path,
        });

        res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code,
          })),
        });
      } else {
        logger.error('Validation error:', error);
        res.status(500).json({ error: 'Internal validation error' });
      }
    }
  };
}

/**
 * Shorthand for body validation
 */
export function validateBody(schema: ZodSchema) {
  return validate(schema, 'body');
}

/**
 * Shorthand for params validation
 */
export function validateParams(schema: ZodSchema) {
  return validate(schema, 'params');
}

/**
 * Shorthand for query validation
 */
export function validateQuery(schema: ZodSchema) {
  return validate(schema, 'query');
}
