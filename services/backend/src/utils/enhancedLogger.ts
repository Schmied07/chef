/**
 * Enhanced Structured Logger with Pino
 * Supports correlation IDs, log levels, and JSON output
 */

import type { Request } from 'express';
import { getEnv } from '../config/env';

interface LogContext {
  requestId?: string;
  userId?: string;
  projectId?: string;
  jobId?: string;
  [key: string]: any;
}

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class EnhancedLogger {
  private shouldLog(level: LogLevel): boolean {
    const configuredLevel = getEnv().LOG_LEVEL;
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const configuredIndex = levels.indexOf(configuredLevel);
    const requestedIndex = levels.indexOf(level);
    
    return requestedIndex >= configuredIndex;
  }

  private formatLog(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const logEntry = {
      level,
      timestamp,
      message,
      ...context,
    };

    // In production, output JSON for log aggregation
    if (getEnv().NODE_ENV === 'production') {
      return JSON.stringify(logEntry);
    }

    // In development, pretty print
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${level.toUpperCase()}] ${timestamp} - ${message}${contextStr}`;
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatLog('debug', message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog('info')) {
      console.log(this.formatLog('info', message, context));
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatLog('warn', message, context));
    }
  }

  error(message: string, error?: Error | any, context?: LogContext): void {
    if (this.shouldLog('error')) {
      const errorContext = {
        ...context,
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : error,
      };
      console.error(this.formatLog('error', message, errorContext));
    }
  }

  /**
   * Create a child logger with attached context
   */
  child(context: LogContext): EnhancedLogger {
    const childLogger = new EnhancedLogger();
    
    // Override methods to include parent context
    const originalDebug = childLogger.debug.bind(childLogger);
    const originalInfo = childLogger.info.bind(childLogger);
    const originalWarn = childLogger.warn.bind(childLogger);
    const originalError = childLogger.error.bind(childLogger);

    childLogger.debug = (message: string, additionalContext?: LogContext) => {
      originalDebug(message, { ...context, ...additionalContext });
    };

    childLogger.info = (message: string, additionalContext?: LogContext) => {
      originalInfo(message, { ...context, ...additionalContext });
    };

    childLogger.warn = (message: string, additionalContext?: LogContext) => {
      originalWarn(message, { ...context, ...additionalContext });
    };

    childLogger.error = (message: string, error?: Error | any, additionalContext?: LogContext) => {
      originalError(message, error, { ...context, ...additionalContext });
    };

    return childLogger;
  }

  /**
   * Create request-scoped logger
   */
  forRequest(req: Request): EnhancedLogger {
    return this.child({
      requestId: (req as any).requestId,
      method: req.method,
      path: req.path,
      ip: req.ip,
    });
  }
}

// Export singleton instance
export const enhancedLogger = new EnhancedLogger();

// Export type for use in other modules
export type { LogContext, LogLevel };
