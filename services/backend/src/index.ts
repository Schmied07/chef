/**
 * @chef/backend - Backend API and Workers
 * 
 * Handles project creation, status tracking, and build orchestration
 */

import express from 'express';
import type { Request, Response } from 'express';
import { projectsRouter } from './routes/projects';
import { hooksRouter } from './routes/hooks';
import { artifactsRouter } from './routes/artifacts';
import { generateRouter } from './routes/generate';
import { errorHandler } from './middleware/error-handler';
import { logger } from './utils/logger';
import { startWorker, stopWorker } from './workers/queue';
import { getRedisClient, checkRedisHealth } from './services/redis';
import { checkDockerHealth } from './services/docker';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', async (_req: Request, res: Response) => {
  const redisHealthy = await checkRedisHealth();
  const dockerHealthy = await checkDockerHealth();

  res.json({
    status: redisHealthy && dockerHealthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    services: {
      redis: redisHealthy ? 'up' : 'down',
      docker: dockerHealthy ? 'up' : 'down',
    },
  });
});

// Metrics endpoint
app.get('/metrics', (_req: Request, res: Response) => {
  const { metrics } = require('./utils/metrics');
  res.json(metrics.getAllMetrics());
});

// API routes
app.use('/v1/projects', projectsRouter);
app.use('/v1/projects', artifactsRouter);
app.use('/v1/hooks', hooksRouter);
app.use('/v1/generate', generateRouter);

// Error handler
app.use(errorHandler);

// Initialize services
async function initialize() {
  try {
    // Initialize Redis
    logger.info('Initializing Redis connection...');
    getRedisClient();

    // Check Docker
    logger.info('Checking Docker availability...');
    const dockerHealthy = await checkDockerHealth();
    if (!dockerHealthy) {
      logger.warn('⚠️  Docker is not available - builds will fail');
    }

    // Start worker
    logger.info('Starting worker...');
    startWorker();

    logger.info('✅ All services initialized');
  } catch (error) {
    logger.error('Failed to initialize services:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  await stopWorker();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  await stopWorker();
  process.exit(0);
});

// Start server
app.listen(PORT, async () => {
  logger.info(`🚀 Chef Backend API running on port ${PORT}`);
  await initialize();
});

export default app;
