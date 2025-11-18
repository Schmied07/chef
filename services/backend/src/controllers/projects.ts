/**
 * Project controllers
 */

import type { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { queueProject } from '../workers/queue';
import { getProject, updateProject, addLog } from '../db/projects';
import { logger } from '../utils/logger';

export async function createProject(req: Request, res: Response) {
  try {
    const { prompt, config } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const projectId = uuidv4();

    // Create project record
    const project = {
      id: projectId,
      prompt,
      config: config || {},
      status: 'queued' as const,
      createdAt: new Date().toISOString(),
    };

    // Queue for processing
    await queueProject(project);

    logger.info(`Project ${projectId} created and queued`);

    res.status(201).json({
      id: projectId,
      status: 'queued',
      message: 'Project queued for generation',
    });
  } catch (error) {
    logger.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
}

export async function getProjectStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const project = await getProject(id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({
      id: project.id,
      status: project.status,
      progress: project.progress || 0,
      updatedAt: project.updatedAt,
    });
  } catch (error) {
    logger.error('Error getting project status:', error);
    res.status(500).json({ error: 'Failed to get project status' });
  }
}

export async function getProjectLogs(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const project = await getProject(id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({
      id: project.id,
      logs: project.logs || [],
    });
  } catch (error) {
    logger.error('Error getting project logs:', error);
    res.status(500).json({ error: 'Failed to get project logs' });
  }
}
