/**
 * Publish controller
 */

import type { Request, Response } from 'express';
import { getProject } from '../db/projects';
import { logger } from '../utils/logger';

export async function publishProject(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const project = await getProject(id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.status !== 'completed') {
      return res.status(400).json({ error: 'Project is not ready to publish' });
    }

    // TODO: Implement actual publishing logic
    logger.info(`Publishing project ${id}`);

    res.json({
      id: project.id,
      status: 'published',
      url: `https://chef-projects.example.com/${id}`,
    });
  } catch (error) {
    logger.error('Error publishing project:', error);
    res.status(500).json({ error: 'Failed to publish project' });
  }
}
