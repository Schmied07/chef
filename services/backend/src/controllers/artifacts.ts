/**
 * Artifacts controller - Handle artifact storage and retrieval
 */

import type { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { logger } from '../utils/logger';
import { config } from '../config';

/**
 * Get artifacts for a project
 */
export async function getArtifacts(req: Request, res: Response) {
  try {
    const { projectId } = req.params;
    const artifactsDir = path.join(config.build.artifactsDir, projectId);

    // Check if artifacts exist
    try {
      await fs.access(artifactsDir);
    } catch (error) {
      return res.status(404).json({ error: 'Artifacts not found' });
    }

    // List all artifacts
    const files = await fs.readdir(artifactsDir, { recursive: true });
    const artifacts = [];

    for (const file of files) {
      const filePath = path.join(artifactsDir, file.toString());
      const stats = await fs.stat(filePath);

      if (stats.isFile()) {
        artifacts.push({
          name: file,
          size: stats.size,
          path: filePath,
          createdAt: stats.ctime,
        });
      }
    }

    res.json({
      projectId,
      artifacts,
      totalSize: artifacts.reduce((sum, a) => sum + a.size, 0),
    });
  } catch (error) {
    logger.error('Error getting artifacts:', error);
    res.status(500).json({ error: 'Failed to get artifacts' });
  }
}

/**
 * Download a specific artifact
 */
export async function downloadArtifact(req: Request, res: Response) {
  try {
    const { projectId, filename } = req.params;
    const filePath = path.join(config.build.artifactsDir, projectId, filename);

    // Security check - ensure path is within artifacts directory
    const resolvedPath = path.resolve(filePath);
    const artifactsRoot = path.resolve(config.build.artifactsDir, projectId);

    if (!resolvedPath.startsWith(artifactsRoot)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      return res.status(404).json({ error: 'Artifact not found' });
    }

    // Send file
    res.download(filePath);
  } catch (error) {
    logger.error('Error downloading artifact:', error);
    res.status(500).json({ error: 'Failed to download artifact' });
  }
}

/**
 * Delete artifacts for a project
 */
export async function deleteArtifacts(req: Request, res: Response) {
  try {
    const { projectId } = req.params;
    const artifactsDir = path.join(config.build.artifactsDir, projectId);

    // Check if artifacts exist
    try {
      await fs.access(artifactsDir);
      await fs.rm(artifactsDir, { recursive: true, force: true });
      logger.info(`Deleted artifacts for project ${projectId}`);
    } catch (error) {
      // Already deleted or doesn't exist
    }

    res.json({ success: true, message: 'Artifacts deleted' });
  } catch (error) {
    logger.error('Error deleting artifacts:', error);
    res.status(500).json({ error: 'Failed to delete artifacts' });
  }
}