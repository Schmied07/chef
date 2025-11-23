/**
 * Request ID Middleware
 * Adds correlation IDs to all requests for tracing
 */

import type { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { setContext } from '../monitoring/sentry';

// Extend Express Request type to include requestId
declare global {
  namespace Express {
    interface Request {
      requestId: string;
    }
  }
}

/**
 * Middleware to generate or extract request ID
 */
export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Check if request already has an ID (from upstream proxy or client)
  const existingId = req.headers['x-request-id'] as string || 
                     req.headers['x-correlation-id'] as string;
  
  // Generate new ID if none exists
  const requestId = existingId || uuidv4();
  
  // Attach to request object
  req.requestId = requestId;
  
  // Add to response headers for client tracking
  res.setHeader('X-Request-ID', requestId);
  
  // Set Sentry context for this request
  setContext('request', {
    requestId,
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });
  
  next();
}

/**
 * Get request ID from current request
 */
export function getRequestId(req: Request): string {
  return req.requestId || 'unknown';
}
