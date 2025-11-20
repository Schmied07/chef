/**
 * Project controllers
 */

import type { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { queueBuildJob, getJobStatus } from '../workers/queue';
import { getProject, createProject as createProjectDb, updateProject, addLog } from '../db/projects';
import { logger } from '../utils/logger';
import type { BuildJob } from '../types/job';

export async function createProject(req: Request, res: Response) {
  try {
    const { files, dependencies, strategy, metadata } = req.body;

    if (!files || !Array.isArray(files)) {
      return res.status(400).json({ error: 'Files array is required' });
    }

    const jobId = uuidv4();
    const projectId = uuidv4();

    // Create build job
    const buildJob: BuildJob = {
      jobId,
      projectId,
      files,
      dependencies: dependencies || {},
      executionMode: 'docker',
      strategy: strategy || {
        runtime: 'node',
        version: '18',
        installCommand: 'npm install',
        buildCommand: 'npm run build',
      },
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString(),
      },
    };

    // Save project to database
    await createProjectDb({
      id: projectId,
      prompt: `Build with ${files.length} files`,
      config: buildJob,
      status: 'queued',
      createdAt: new Date().toISOString(),
    });

    // Queue build job
    await queueBuildJob(buildJob);

    logger.info(`Project ${projectId} created and build job ${jobId} queued`);

    res.status(201).json({
      projectId,
      jobId,
      status: 'queued',
      message: 'Build job queued successfully',
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
