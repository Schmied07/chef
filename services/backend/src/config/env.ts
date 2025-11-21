/**
 * Centralized environment variables management
 * Validates all required variables at startup
 */

import { z } from 'zod';
import { logger } from '../utils/logger';

/**
 * Environment variable schema
 */
const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().regex(/^\d+$/).transform(Number).default('3001'),

  // Redis
  REDIS_HOST: z.string().min(1, 'REDIS_HOST is required'),
  REDIS_PORT: z.string().regex(/^\d+$/).transform(Number).default('6379'),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_TLS: z.string().transform((val) => val === 'true').default('false'),

  // Docker
  DOCKER_HOST: z.string().optional(),
  DOCKER_SANDBOX_TIMEOUT: z.string().regex(/^\d+$/).transform(Number).default('300000'),

  // WebSocket
  WEBSOCKET_ENABLED: z.string().transform((val) => val === 'true').default('false'),
  WEBSOCKET_CORS_ORIGIN: z.string().default('*'),

  // Webhook
  WEBHOOK_RETRY_ENABLED: z.string().transform((val) => val === 'true').default('false'),
  WEBHOOK_RETRY_MAX_ATTEMPTS: z.string().regex(/^\d+$/).transform(Number).default('3'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().regex(/^\d+$/).transform(Number).default('900000'), // 15 min
  RATE_LIMIT_MAX_REQUESTS: z.string().regex(/^\d+$/).transform(Number).default('100'),
  RATE_LIMIT_GENERATE_MAX: z.string().regex(/^\d+$/).transform(Number).default('5'),
  RATE_LIMIT_BUILD_MAX: z.string().regex(/^\d+$/).transform(Number).default('3'),

  // Security
  CSP_NONCE_ENABLED: z.string().transform((val) => val === 'true').default('false'),
  HELMET_ENABLED: z.string().transform((val) => val === 'true').default('true'),

  // AI/LLM (optional)
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  GOOGLE_API_KEY: z.string().optional(),

  // Monitoring
  SENTRY_DSN: z.string().url().optional(),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

export type EnvConfig = z.infer<typeof envSchema>;

let config: EnvConfig | null = null;

/**
 * Validates and loads environment variables
 * Throws error if validation fails
 */
export function loadEnv(): EnvConfig {
  if (config) {
    return config;
  }

  try {
    logger.info('Loading and validating environment variables...');
    config = envSchema.parse(process.env);
    logger.info('✅ Environment variables validated successfully');
    return config;
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('❌ Environment validation failed:');
      error.errors.forEach((err) => {
        logger.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      throw new Error('Invalid environment configuration. Check logs for details.');
    }
    throw error;
  }
}

/**
 * Gets current environment config
 * @throws if env not loaded
 */
export function getEnv(): EnvConfig {
  if (!config) {
    throw new Error('Environment not loaded. Call loadEnv() first.');
  }
  return config;
}

/**
 * Checks if a secret is configured
 */
export function hasSecret(key: keyof EnvConfig): boolean {
  const env = getEnv();
  return !!env[key];
}

/**
 * Gets a secret value
 * @throws if secret not configured
 */
export function getSecret(key: keyof EnvConfig): string {
  const env = getEnv();
  const value = env[key];
  if (!value) {
    throw new Error(`Secret ${key} is not configured`);
  }
  return String(value);
}
