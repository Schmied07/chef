/**
 * Prometheus Metrics Integration
 * Enhanced metrics collection using prom-client
 */

import client from 'prom-client';
import type { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

// Initialize default metrics (CPU, memory, etc.)
const register = new client.Registry();
client.collectDefaultMetrics({ register });

/**
 * HTTP Request Duration Histogram
 */
export const httpRequestDuration = new client.Histogram({
  name: 'chef_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.001, 0.01, 0.1, 0.5, 1, 2, 5, 10], // 1ms to 10s
  registers: [register],
});

/**
 * HTTP Request Counter
 */
export const httpRequestCounter = new client.Counter({
  name: 'chef_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

/**
 * Active Requests Gauge
 */
export const activeRequests = new client.Gauge({
  name: 'chef_http_requests_active',
  help: 'Number of active HTTP requests',
  labelNames: ['method', 'route'],
  registers: [register],
});

/**
 * Build Job Duration Histogram
 */
export const buildDuration = new client.Histogram({
  name: 'chef_build_duration_seconds',
  help: 'Duration of build jobs in seconds',
  labelNames: ['template', 'status'],
  buckets: [1, 5, 10, 30, 60, 120, 300, 600], // 1s to 10min
  registers: [register],
});

/**
 * Build Job Counter
 */
export const buildCounter = new client.Counter({
  name: 'chef_builds_total',
  help: 'Total number of builds',
  labelNames: ['template', 'status'],
  registers: [register],
});

/**
 * Queue Size Gauge
 */
export const queueSize = new client.Gauge({
  name: 'chef_queue_size',
  help: 'Number of jobs in the queue',
  labelNames: ['queue', 'status'],
  registers: [register],
});

/**
 * Queue Job Duration Histogram
 */
export const queueJobDuration = new client.Histogram({
  name: 'chef_queue_job_duration_seconds',
  help: 'Duration of queue jobs in seconds',
  labelNames: ['queue', 'status'],
  buckets: [1, 5, 10, 30, 60, 120, 300, 600],
  registers: [register],
});

/**
 * Active Jobs Gauge
 */
export const activeJobs = new client.Gauge({
  name: 'chef_queue_jobs_active',
  help: 'Number of active jobs being processed',
  labelNames: ['queue'],
  registers: [register],
});

/**
 * Error Counter
 */
export const errorCounter = new client.Counter({
  name: 'chef_errors_total',
  help: 'Total number of errors',
  labelNames: ['type', 'severity'],
  registers: [register],
});

/**
 * WebSocket Connections Gauge
 */
export const websocketConnections = new client.Gauge({
  name: 'chef_websocket_connections',
  help: 'Number of active WebSocket connections',
  registers: [register],
});

/**
 * Docker Container Gauge
 */
export const dockerContainers = new client.Gauge({
  name: 'chef_docker_containers',
  help: 'Number of Docker containers',
  labelNames: ['status'],
  registers: [register],
});

/**
 * Middleware to track HTTP metrics
 */
export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const route = req.route?.path || req.path || 'unknown';
  const method = req.method;

  // Increment active requests
  activeRequests.inc({ method, route });

  // Track response
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000; // Convert to seconds
    const statusCode = res.statusCode.toString();

    // Record metrics
    httpRequestDuration.observe({ method, route, status_code: statusCode }, duration);
    httpRequestCounter.inc({ method, route, status_code: statusCode });
    activeRequests.dec({ method, route });

    // Log slow requests (> 5s)
    if (duration > 5) {
      logger.warn(`Slow request detected: ${method} ${route} took ${duration.toFixed(2)}s`);
    }
  });

  next();
}

/**
 * Track build job metrics
 */
export function trackBuildJob(template: string, status: 'success' | 'failure', durationMs: number): void {
  const durationSeconds = durationMs / 1000;
  
  buildDuration.observe({ template, status }, durationSeconds);
  buildCounter.inc({ template, status });
  
  logger.info(`Build completed: template=${template}, status=${status}, duration=${durationSeconds.toFixed(2)}s`);
}

/**
 * Update queue size metrics
 */
export function updateQueueMetrics(queue: string, waiting: number, active: number, completed: number, failed: number): void {
  queueSize.set({ queue, status: 'waiting' }, waiting);
  queueSize.set({ queue, status: 'active' }, active);
  queueSize.set({ queue, status: 'completed' }, completed);
  queueSize.set({ queue, status: 'failed' }, failed);
  
  activeJobs.set({ queue }, active);
}

/**
 * Track queue job duration
 */
export function trackQueueJob(queue: string, status: 'success' | 'failure', durationMs: number): void {
  const durationSeconds = durationMs / 1000;
  queueJobDuration.observe({ queue, status }, durationSeconds);
}

/**
 * Track errors
 */
export function trackError(type: string, severity: 'low' | 'medium' | 'high' | 'critical'): void {
  errorCounter.inc({ type, severity });
}

/**
 * Update WebSocket connections
 */
export function updateWebSocketConnections(count: number): void {
  websocketConnections.set(count);
}

/**
 * Update Docker container counts
 */
export function updateDockerContainers(running: number, stopped: number): void {
  dockerContainers.set({ status: 'running' }, running);
  dockerContainers.set({ status: 'stopped' }, stopped);
}

/**
 * Get metrics in Prometheus format
 */
export async function getMetrics(): Promise<string> {
  return await register.metrics();
}

/**
 * Get metrics as JSON
 */
export async function getMetricsJSON(): Promise<object> {
  const metrics = await register.getMetricsAsJSON();
  return metrics;
}

/**
 * Reset all metrics (for testing)
 */
export function resetMetrics(): void {
  register.resetMetrics();
  logger.info('Metrics reset');
}

logger.info('✅ Prometheus metrics initialized');
