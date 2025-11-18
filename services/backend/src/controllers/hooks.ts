/**
 * Webhook controllers
 */

import type { Request, Response } from 'express';
import { updateProject } from '../db/projects';
import { logger } from '../utils/logger';

export async function handleWorkerResult(req: Request, res: Response) {
  try {
    const { projectId, status, result, error } = req.body;

    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }

    logger.info(`Worker result received for project ${projectId}: ${status}`);

    // Update project with worker result
    await updateProject(projectId, {
      status,
      result,
      error,
      completedAt: new Date().toISOString(),
    });

    res.json({ success: true });
  } catch (error) {
    logger.error('Error handling worker result:', error);
    res.status(500).json({ error: 'Failed to process worker result' });
  }
}
