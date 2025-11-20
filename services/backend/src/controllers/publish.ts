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
      return res.status(400).json({ error: 'Project must be completed before publishing' });
    }

    // TODO: Implement actual publishing logic
    // This could deploy to Vercel, Netlify, etc.

    logger.info(`Publishing project ${id}`);

    res.json({
      success: true,
      message: 'Project published successfully',
      url: `https://chef-project-${id}.vercel.app`, // Mock URL
    });
  } catch (error) {
    logger.error('Error publishing project:', error);
    res.status(500).json({ error: 'Failed to publish project' });
  }
}