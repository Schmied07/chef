/**
 * WebSocket service for real-time updates
 */

import { Server as SocketIOServer } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import { logger } from '../utils/logger';

let io: SocketIOServer | null = null;

export interface ProgressUpdate {
  jobId: string;
  projectId: string;
  status: 'queued' | 'preparing' | 'installing' | 'building' | 'completed' | 'failed';
  progress: number;
  message: string;
  phase?: string;
  logs?: any[];
}

/**
 * Initialize WebSocket server
 */
export function initializeWebSocket(httpServer: HTTPServer): SocketIOServer {
  if (io) {
    logger.warn('WebSocket server already initialized');
    return io;
  }

  const corsOrigin = process.env.WEBSOCKET_CORS_ORIGIN || '*';

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: corsOrigin,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    path: '/ws',
    transports: ['websocket', 'polling'],
  });

  // Connection handler
  io.on('connection', (socket) => {
    logger.info(`🔌 WebSocket client connected: ${socket.id}`);

    // Subscribe to specific job updates
    socket.on('subscribe:job', (jobId: string) => {
      socket.join(`job:${jobId}`);
      logger.info(`Client ${socket.id} subscribed to job ${jobId}`);
    });

    // Subscribe to specific project updates
    socket.on('subscribe:project', (projectId: string) => {
      socket.join(`project:${projectId}`);
      logger.info(`Client ${socket.id} subscribed to project ${projectId}`);
    });

    // Unsubscribe from job
    socket.on('unsubscribe:job', (jobId: string) => {
      socket.leave(`job:${jobId}`);
      logger.info(`Client ${socket.id} unsubscribed from job ${jobId}`);
    });

    // Unsubscribe from project
    socket.on('unsubscribe:project', (projectId: string) => {
      socket.leave(`project:${projectId}`);
      logger.info(`Client ${socket.id} unsubscribed from project ${projectId}`);
    });

    socket.on('disconnect', () => {
      logger.info(`🔌 WebSocket client disconnected: ${socket.id}`);
    });
  });

  logger.info('✅ WebSocket server initialized');
  return io;
}

/**
 * Get WebSocket server instance
 */
export function getWebSocketServer(): SocketIOServer | null {
  return io;
}

/**
 * Emit progress update to subscribed clients
 */
export function emitProgress(update: ProgressUpdate): void {
  if (!io) {
    logger.warn('WebSocket not initialized, skipping progress update');
    return;
  }

  // Emit to job subscribers
  io.to(`job:${update.jobId}`).emit('job:progress', update);

  // Emit to project subscribers
  io.to(`project:${update.projectId}`).emit('project:progress', update);

  logger.debug(`📡 Progress update emitted for job ${update.jobId}: ${update.progress}%`);
}

/**
 * Emit log entry to subscribed clients
 */
export function emitLog(jobId: string, projectId: string, log: any): void {
  if (!io) {
    return;
  }

  io.to(`job:${jobId}`).emit('job:log', log);
  io.to(`project:${projectId}`).emit('project:log', log);
}

/**
 * Emit completion event
 */
export function emitCompletion(jobId: string, projectId: string, result: any): void {
  if (!io) {
    return;
  }

  io.to(`job:${jobId}`).emit('job:completed', result);
  io.to(`project:${projectId}`).emit('project:completed', result);

  logger.info(`✅ Completion event emitted for job ${jobId}`);
}

/**
 * Emit error event
 */
export function emitError(jobId: string, projectId: string, error: any): void {
  if (!io) {
    return;
  }

  io.to(`job:${jobId}`).emit('job:error', error);
  io.to(`project:${projectId}`).emit('project:error', error);

  logger.error(`❌ Error event emitted for job ${jobId}`);
}

/**
 * Close WebSocket server
 */
export async function closeWebSocket(): Promise<void> {
  if (io) {
    await new Promise<void>((resolve) => {
      io!.close(() => {
        logger.info('WebSocket server closed');
        resolve();
      });
    });
    io = null;
  }
}

/**
 * Get connected clients count
 */
export function getConnectedClientsCount(): number {
  return io ? io.sockets.sockets.size : 0;
}

/**
 * Get room subscribers count
 */
export function getRoomSubscribersCount(room: string): number {
  if (!io) return 0;
  const roomSet = io.sockets.adapter.rooms.get(room);
  return roomSet ? roomSet.size : 0;
}
