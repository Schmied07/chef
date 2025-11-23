/**
 * Sentry Integration for Backend
 * Error tracking and performance monitoring
 */

import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import type { Express, Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { getEnv } from '../config/env';

/**
 * Initialize Sentry
 */
export function initSentry(): void {
  const env = getEnv();
  
  // Only initialize if DSN is provided
  if (!env.SENTRY_DSN) {
    logger.info('⚠️  Sentry DSN not configured - error tracking disabled');
    return;
  }

  try {
    Sentry.init({
      dsn: env.SENTRY_DSN,
      environment: env.NODE_ENV,
      
      // Performance monitoring
      tracesSampleRate: env.SENTRY_TRACES_SAMPLE_RATE || 0.1,
      profilesSampleRate: env.SENTRY_PROFILES_SAMPLE_RATE || 0.1,
      
      // Integrations
      integrations: [
        // HTTP integration for tracing requests
        Sentry.httpIntegration(),
        // Profiling
        nodeProfilingIntegration(),
      ],
      
      // Release tracking
      release: process.env.SENTRY_RELEASE || `backend@${process.env.npm_package_version || 'unknown'}`,
      
      // Before send hook - sanitize sensitive data
      beforeSend(event, hint) {
        // Remove sensitive data from event
        if (event.request) {
          delete event.request.cookies;
          
          // Redact common sensitive headers
          if (event.request.headers) {
            const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
            sensitiveHeaders.forEach(header => {
              if (event.request?.headers?.[header]) {
                event.request.headers[header] = '[Redacted]';
              }
            });
          }
        }
        
        return event;
      },
    });

    logger.info('✅ Sentry initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize Sentry:', error);
  }
}

/**
 * Setup Sentry middleware for Express
 * Must be registered BEFORE all routes
 */
export function setupSentryMiddleware(app: Express): void {
  if (!getEnv().SENTRY_DSN) {
    return;
  }

  // Setup Express integration for Sentry (automatically tracks requests)
  Sentry.setupExpressErrorHandler(app);
  
  logger.info('✅ Sentry middleware configured');
}

/**
 * Setup Sentry error handler for Express
 * Must be registered AFTER all routes but BEFORE other error handlers
 */
export function setupSentryErrorHandler(app: Express): void {
  if (!getEnv().SENTRY_DSN) {
    return;
  }

  // Error handler middleware
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    Sentry.captureException(err);
    next(err);
  });
  
  logger.info('✅ Sentry error handler configured');
}

/**
 * Capture an exception with context
 */
export function captureException(error: Error, context?: Record<string, any>): void {
  if (!getEnv().SENTRY_DSN) {
    logger.error('Exception (Sentry disabled):', error, context);
    return;
  }

  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Capture a message with context
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info', context?: Record<string, any>): void {
  if (!getEnv().SENTRY_DSN) {
    logger.info(`Message (Sentry disabled): ${message}`, context);
    return;
  }

  Sentry.captureMessage(message, {
    level,
    extra: context,
  });
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(message: string, data?: Record<string, any>): void {
  if (!getEnv().SENTRY_DSN) {
    return;
  }

  Sentry.addBreadcrumb({
    message,
    data,
    timestamp: Date.now() / 1000,
  });
}

/**
 * Set user context
 */
export function setUser(user: { id: string; email?: string; username?: string }): void {
  if (!getEnv().SENTRY_DSN) {
    return;
  }

  Sentry.setUser(user);
}

/**
 * Set custom context
 */
export function setContext(name: string, context: Record<string, any>): void {
  if (!getEnv().SENTRY_DSN) {
    return;
  }

  Sentry.setContext(name, context);
}

/**
 * Start a transaction for performance monitoring
 */
export function startTransaction(name: string, op: string): ReturnType<typeof Sentry.startSpan> | null {
  if (!getEnv().SENTRY_DSN) {
    return null;
  }

  return Sentry.startSpan({
    name,
    op,
  }, (span) => span);
}

/**
 * Flush all pending events
 */
export async function flushSentry(timeout = 2000): Promise<boolean> {
  if (!getEnv().SENTRY_DSN) {
    return true;
  }

  return await Sentry.flush(timeout);
}
