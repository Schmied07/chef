/**
 * Configuration management
 */

export const config = {
  server: {
    port: parseInt(process.env.PORT || '3001'),
    env: process.env.NODE_ENV || 'development',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
  },
  worker: {
    concurrency: parseInt(process.env.WORKER_CONCURRENCY || '5'),
    timeout: parseInt(process.env.WORKER_TIMEOUT || '300000'),
  },
  docker: {
    host: process.env.DOCKER_HOST || 'unix:///var/run/docker.sock',
    memoryLimit: process.env.DOCKER_MEMORY_LIMIT || '512m',
    cpuLimit: parseFloat(process.env.DOCKER_CPU_LIMIT || '1'),
  },
  build: {
    dir: process.env.BUILD_DIR || '/tmp/chef-builds',
    artifactsDir: process.env.ARTIFACTS_DIR || '/tmp/chef-artifacts',
  },
  convex: {
    url: process.env.CONVEX_URL || 'https://api.convex.dev',
    webhookSecret: process.env.CONVEX_WEBHOOK_SECRET || '',
  },
  websocket: {
    enabled: process.env.WEBSOCKET_ENABLED === 'true',
    corsOrigin: process.env.WEBSOCKET_CORS_ORIGIN || '*',
  },
  webhookRetry: {
    enabled: process.env.WEBHOOK_RETRY_ENABLED === 'true',
    maxRetries: parseInt(process.env.WEBHOOK_MAX_RETRIES || '3'),
    retryDelay: parseInt(process.env.WEBHOOK_RETRY_DELAY || '5000'),
  },
};

export default config;