/**
 * @chef/backend - Backend API and Workers
 * 
 * Handles project creation, status tracking, and build orchestration
 */

import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import type { Request, Response } from 'express';
import { projectsRouter } from './routes/projects';
import { hooksRouter } from './routes/hooks';
import { artifactsRouter } from './routes/artifacts';
import { generateRouter } from './routes/generate';
import { queueRouter } from './routes/queue';
import { errorHandler } from './middleware/error-handler';
import { logger } from './utils/logger';
import { metrics } from './utils/metrics';
import { startWorker, stopWorker } from './workers/queue';
import { getRedisClient, checkRedisHealth } from './services/redis';
import { checkDockerHealth } from './services/docker';
import { initializeWebSocket, closeWebSocket, getConnectedClientsCount } from './services/websocket';
import { startWebhookRetryWorker, stopWebhookRetryWorker, getWebhookRetryStats } from './services/webhook-retry';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

// Security Middleware - Helmet with CSP
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"], // Needed for preview iframe
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'ws:', 'wss:'],
        fontSrc: ["'self'", 'data:'],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'self'"],
        frameAncestors: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false, // Allow iframe embedding
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS Middleware
app.use(cors({
  origin: process.env.WEBSOCKET_CORS_ORIGIN || '*',
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Import rate limiters
import { globalRateLimiter } from './middleware/rate-limit';

// Apply global rate limiting
app.use('/v1/', globalRateLimiter);

// CSP Reporting endpoint
app.post('/csp-report', express.json({ type: 'application/csp-report' }), (req: Request, res: Response) => {
  logger.warn('CSP Violation:', req.body);
  res.status(204).send();
});

// Health check
app.get('/health', async (_req: Request, res: Response) => {
  const redisHealthy = await checkRedisHealth();
  const dockerHealthy = await checkDockerHealth();
  const websocketEnabled = process.env.WEBSOCKET_ENABLED === 'true';

  res.json({
    status: redisHealthy && dockerHealthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    services: {
      redis: redisHealthy ? 'up' : 'down',
      docker: dockerHealthy ? 'up' : 'down',
      websocket: websocketEnabled ? 'enabled' : 'disabled',
    },
    websocket: {
      enabled: websocketEnabled,
      connected_clients: websocketEnabled ? getConnectedClientsCount() : 0,
    },
  });
});

// Metrics endpoint (JSON)
app.get('/metrics', async (_req: Request, res: Response) => {
  const webhookStats = await getWebhookRetryStats();
  res.json({
    ...metrics.getAllMetrics(),
    webhookRetry: webhookStats,
  });
});

// Metrics endpoint (Prometheus format)
app.get('/metrics/prometheus', (_req: Request, res: Response) => {
  res.set('Content-Type', 'text/plain');
  res.send(metrics.getPrometheusMetrics());
});

// API routes
app.use('/v1/projects', projectsRouter);
app.use('/v1/projects', artifactsRouter);
app.use('/v1/hooks', hooksRouter);
app.use('/v1/generate', generateRouter);
app.use('/v1/queue', queueRouter);

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

    // Initialize WebSocket if enabled
    const websocketEnabled = process.env.WEBSOCKET_ENABLED === 'true';
    if (websocketEnabled) {
      logger.info('Initializing WebSocket server...');
      initializeWebSocket(server);
    } else {
      logger.info('WebSocket disabled');
    }

    // Start webhook retry worker if enabled
    const webhookRetryEnabled = process.env.WEBHOOK_RETRY_ENABLED === 'true';
    if (webhookRetryEnabled) {
      logger.info('Starting webhook retry worker...');
      startWebhookRetryWorker();
    }

    // Start build worker
    logger.info('Starting build worker...');
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
  await stopWebhookRetryWorker();
  await closeWebSocket();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  await stopWorker();
  await stopWebhookRetryWorker();
  await closeWebSocket();
  process.exit(0);
});

// Start server
server.listen(PORT, async () => {
  logger.info(`🚀 Chef Backend API running on port ${PORT}`);
  await initialize();
});

export default app;
