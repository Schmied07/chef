/**
 * Input sanitization middleware
 */

import type { Request, Response, NextFunction } from 'express';
import validator from 'validator';
import { logger } from '../utils/logger';

/**
 * Sanitize string by removing dangerous characters
 */
export function sanitizeString(str: string): string {
  // Remove HTML tags
  let sanitized = validator.stripLow(str);
  sanitized = validator.escape(sanitized);
  
  // Remove dangerous patterns
  sanitized = sanitized.replace(/<script|<\/script|javascript:|onerror=|onload=/gi, '');
  
  return sanitized;
}

/**
 * Normalize file path to prevent path traversal
 */
export function normalizePath(filePath: string): string {
  // Remove dangerous patterns
  let normalized = filePath.replace(/\.\./g, '');
  normalized = normalized.replace(/^\/+/, '');
  
  // Ensure it starts with ./ if relative
  if (!normalized.startsWith('./') && !normalized.startsWith('/')) {
    normalized = './' + normalized;
  }
  
  return normalized;
}

/**
 * Validate and sanitize file content
 */
export function sanitizeFileContent(content: string): string {
  // For now, just check size and remove null bytes
  if (content.length > 10 * 1024 * 1024) {
    throw new Error('File content too large');
  }
  
  return content.replace(/\0/g, '');
}

/**
 * Middleware to sanitize request body strings
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body);
    }
    next();
  } catch (error) {
    logger.error('Sanitization error:', error);
    res.status(400).json({ error: 'Invalid input data' });
  }
}

/**
 * Recursively sanitize an object
 */
function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  
  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Sanitize key name
      const sanitizedKey = sanitizeString(key);
      sanitized[sanitizedKey] = sanitizeObject(value);
    }
    return sanitized;
  }
  
  return obj;
}

/**
 * Check for XSS patterns
 */
export function containsXSS(str: string): boolean {
  const xssPatterns = [
    /<script/i,
    /<\/script/i,
    /javascript:/i,
    /onerror=/i,
    /onload=/i,
    /<iframe/i,
    /onclick=/i,
    /onmouseover=/i,
  ];
  
  return xssPatterns.some((pattern) => pattern.test(str));
}

/**
 * Check for SQL injection patterns
 */
export function containsSQLInjection(str: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
    /--|;/,
    /'/,
    /\*/,
  ];
  
  return sqlPatterns.some((pattern) => pattern.test(str));
}
