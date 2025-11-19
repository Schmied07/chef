import pino from 'pino';
import type { LoggerConfig } from '../types/index.js';

/**
 * Create a logger instance
 */
export function createLogger(config: LoggerConfig = {}) {
  const { level = 'info', pretty = process.env.NODE_ENV === 'development' } = config;

  return pino({
    level,
    transport: pretty
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
  });
}

export type Logger = ReturnType<typeof createLogger>;