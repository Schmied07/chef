/**
 * Webhook controllers
 */

import type { Request, Response } from 'express';
import { updateProject } from '../db/projects';
import { logger } from '../utils/logger';

export async function handleWorkerResult(req: Request, res: Response) {
  try {
    const { jobId, projectId, status, logs, artifacts, metrics, error } = req.body;

    logger.info(`Received worker result for job ${jobId}`);

    // Update project with results
    await updateProject(projectId, {
      status: status === 'success' ? 'completed' : 'failed',
      progress: 100,
      result: { logs, artifacts, metrics },
      error,
      completedAt: new Date().toISOString(),
    });

    res.json({ success: true });
  } catch (error) {
    logger.error('Error handling worker result:', error);
    res.status(500).json({ error: 'Failed to handle worker result' });
  }
}