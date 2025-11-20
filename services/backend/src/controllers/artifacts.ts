/**
 * Artifacts controllers
 */

import type { Request, Response } from 'express';
import path from 'path';
import fs from 'fs/promises';
import { getProject } from '../db/projects';
import { logger } from '../utils/logger';
import { config } from '../config';

export async function getArtifacts(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const project = await getProject(id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const artifacts = (project.result as any)?.artifacts || [];

    res.json({
      id: project.id,
      artifacts,
    });
  } catch (error) {
    logger.error('Error getting artifacts:', error);
    res.status(500).json({ error: 'Failed to get artifacts' });
  }
}

export async function downloadArtifact(req: Request, res: Response) {
  try {
    const { id, name } = req.params;
    const project = await getProject(id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // TODO: Get jobId from project
    const jobId = (project.config as any)?.jobId;
    if (!jobId) {
      return res.status(404).json({ error: 'Job ID not found' });
    }

    const artifactPath = path.join(config.build.artifactsDir, jobId, name);

    // Check if file exists
    try {
      await fs.access(artifactPath);
    } catch {
      return res.status(404).json({ error: 'Artifact not found' });
    }

    res.download(artifactPath);
  } catch (error) {
    logger.error('Error downloading artifact:', error);
    res.status(500).json({ error: 'Failed to download artifact' });
  }
}