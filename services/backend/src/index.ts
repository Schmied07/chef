/**
 * @chef/backend - Backend API and Workers
 * 
 * Handles project creation, status tracking, and build orchestration
 */

import express from 'express';
import type { Request, Response } from 'express';
import { projectsRouter } from './routes/projects';
import { hooksRouter } from './routes/hooks';
import { errorHandler } from './middleware/error-handler';
import { logger } from './utils/logger';

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
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/v1/projects', projectsRouter);
app.use('/v1/hooks', hooksRouter);

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Chef Backend API running on port ${PORT}`);
});

export default app;
