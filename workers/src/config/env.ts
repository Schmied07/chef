import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

/**
 * Environment variables schema
 */
const envSchema = z.object({
  // Redis
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),

  // Server
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Convex
  CONVEX_URL: z.string().optional(),
  CONVEX_DEPLOY_KEY: z.string().optional(),

  // Docker
  DOCKER_NETWORK: z.string().default('chef-workers-network'),

  // Worker Configuration
  WORKER_MEMORY_LIMIT: z.string().default('512m'),
  WORKER_CPU_LIMIT: z.coerce.number().default(1),
  WORKER_TIMEOUT: z.coerce.number().default(300000), // 5 minutes
  MAX_CONCURRENT_WORKERS: z.coerce.number().default(5),
});

const env = envSchema.parse(process.env);

export const config = {
  redis: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD,
  },
  server: {
    port: env.PORT,
    nodeEnv: env.NODE_ENV,
  },
  convex: {
    url: env.CONVEX_URL,
    deployKey: env.CONVEX_DEPLOY_KEY,
  },
  docker: {
    network: env.DOCKER_NETWORK,
  },
  worker: {
    memoryLimit: env.WORKER_MEMORY_LIMIT,
    cpuLimit: env.WORKER_CPU_LIMIT,
    timeout: env.WORKER_TIMEOUT,
    maxConcurrent: env.MAX_CONCURRENT_WORKERS,
  },
} as const;

export type Config = typeof config;
