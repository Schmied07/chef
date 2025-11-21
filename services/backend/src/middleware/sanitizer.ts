/**
 * Input sanitization middleware
 * Prevents XSS, SQL injection, and other attacks
 */

import type { Request, Response, NextFunction } from 'express';
import validator from 'validator';
import { logger } from '../utils/logger';

/**
 * Sanitizes a string value
 */
function sanitizeString(value: string): string {
  // Remove null bytes
  let sanitized = value.replace(/\0/g, '');

  // Escape HTML entities to prevent XSS
  sanitized = validator.escape(sanitized);

  // Trim whitespace
  sanitized = validator.trim(sanitized);

  return sanitized;
}

/**
 * Recursively sanitizes an object
 */
function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (obj !== null && typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Sanitize key to prevent prototype pollution
      const sanitizedKey = validator.escape(key);
      if (sanitizedKey !== '__proto__' && sanitizedKey !== 'constructor' && sanitizedKey !== 'prototype') {
        sanitized[sanitizedKey] = sanitizeObject(value);
      }
    }
    return sanitized;
  }

  return obj;
}

/**
 * Middleware to sanitize request inputs
 */
export function sanitizeInputs() {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Sanitize body
      if (req.body && typeof req.body === 'object') {
        req.body = sanitizeObject(req.body);
      }

      // Sanitize query params
      if (req.query && typeof req.query === 'object') {
        req.query = sanitizeObject(req.query);
      }

      // Sanitize URL params
      if (req.params && typeof req.params === 'object') {
        req.params = sanitizeObject(req.params);
      }

      next();
    } catch (error) {
      logger.error('Sanitization error:', error);
      res.status(400).json({ error: 'Invalid input data' });
    }
  };
}

/**
 * Validates and normalizes file paths to prevent path traversal
 */
export function sanitizeFilePath(path: string): string {
  // Remove null bytes
  let sanitized = path.replace(/\0/g, '');

  // Normalize path (resolve .. and .)
  sanitized = sanitized.replace(/\.\.\/|\.\.\\/g, '');

  // Remove leading slashes
  sanitized = sanitized.replace(/^\/+/, '');

  // Ensure no absolute paths
  if (sanitized.startsWith('/') || /^[a-zA-Z]:/.test(sanitized)) {
    throw new Error('Absolute paths are not allowed');
  }

  return sanitized;
}

/**
 * Validates URL to prevent SSRF attacks
 */
export function validateUrl(url: string): boolean {
  if (!validator.isURL(url, { protocols: ['http', 'https'] })) {
    return false;
  }

  // Prevent localhost and private IP ranges
  const hostname = new URL(url).hostname;
  const privateIpRegex = /^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.|127\.|localhost|0\.0\.0\.0)/i;

  if (privateIpRegex.test(hostname)) {
    return false;
  }

  return true;
}
