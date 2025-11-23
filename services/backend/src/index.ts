/**
 * @chef/backend - Backend API and Workers
 * 
 * Handles project creation, status tracking, and build orchestration
 */

import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';
import { projectsRouter } from './routes/projects';
import { hooksRouter } from './routes/hooks';
import { artifactsRouter } from './routes/artifacts';
import { generateRouter } from './routes/generate';
import { queueRouter } from './routes/queue';
import { errorHandler } from './middleware/error-handler';
import { sanitizeInputs } from './middleware/sanitizer';
import { logger } from './utils/logger';
import { enhancedLogger } from './utils/enhancedLogger';
import { metrics } from './utils/metrics';
import { startWorker, stopWorker } from './workers/queue';
import { getRedisClient, checkRedisHealth } from './services/redis';
import { checkDockerHealth } from './services/docker';
import { initializeWebSocket, closeWebSocket, getConnectedClientsCount } from './services/websocket';
import { startWebhookRetryWorker, stopWebhookRetryWorker, getWebhookRetryStats } from './services/webhook-retry';
import { globalRateLimiter } from './middleware/rate-limit';
import { loadEnv, getEnv } from './config/env';
import { initSentry, setupSentryMiddleware, setupSentryErrorHandler, flushSentry } from './monitoring/sentry';
import { metricsMiddleware, getMetrics, getMetricsJSON } from './monitoring/prometheus';
import { requestIdMiddleware } from './middleware/requestId';
import { initAnalytics, flushAnalytics, getAnalyticsStats } from './monitoring/analytics';

const app = express();
const server = http.createServer(app);

// Load and validate environment variables at startup
const env = loadEnv();
const PORT = env.PORT;

// Initialize Sentry BEFORE any middleware
initSentry();

// Sentry request handler - must be first
setupSentryMiddleware(app);

// Request ID middleware - for correlation
app.use(requestIdMiddleware);

// Prometheus metrics middleware
app.use(metricsMiddleware);

// CSP Nonce generation middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  res.locals.cspNonce = crypto.randomBytes(16).toString('base64');
  next();
});

// Security Middleware - Helmet with strict CSP + dynamic nonce
app.use((req: Request, res: Response, next: NextFunction) => {
  const nonce = res.locals.cspNonce;
  
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          env.CSP_NONCE_ENABLED ? `'nonce-${nonce}'` : "'unsafe-inline'",
        ],
        styleSrc: ["'self'", "'unsafe-inline'"], // CSS often needs inline styles
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'ws:', 'wss:', 'https:'],
        fontSrc: ["'self'", 'data:'],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'self'"],
        frameAncestors: ["'self'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        upgradeInsecureRequests: env.NODE_ENV === 'production' ? [] : null,
      },
      reportOnly: false,
    },
    crossOriginEmbedderPolicy: false, // Allow iframe embedding for preview
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    noSniff: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    xssFilter: true,
  })(req, res, next);
});

// CORS Middleware
app.use(cors({
  origin: process.env.WEBSOCKET_CORS_ORIGIN || '*',
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input sanitization middleware (before validation)
app.use(sanitizeInputs());

// Logging middleware with request context
app.use((req, res, next) => {
  const reqLogger = enhancedLogger.forRequest(req);
  reqLogger.info(`${req.method} ${req.path}`);
  next();
});

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

// Metrics endpoint (JSON) - Enhanced with Prometheus metrics
app.get('/metrics', async (_req: Request, res: Response) => {
  const webhookStats = await getWebhookRetryStats();
  const prometheusMetrics = await getMetricsJSON();
  const analyticsStats = getAnalyticsStats();
  
  res.json({
    // Legacy metrics
    legacy: metrics.getAllMetrics(),
    // Prometheus metrics
    prometheus: prometheusMetrics,
    // Service stats
    webhookRetry: webhookStats,
    analytics: analyticsStats,
  });
});

// Metrics endpoint (Prometheus format) - Enhanced
app.get('/metrics/prometheus', async (_req: Request, res: Response) => {
  res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
  
  // Combine legacy and new Prometheus metrics
  const legacyMetrics = metrics.getPrometheusMetrics();
  const newMetrics = await getMetrics();
  
  res.send(`${legacyMetrics}\n${newMetrics}`);

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
