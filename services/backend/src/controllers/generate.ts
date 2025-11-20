/**
 * AI Generation controller
 */

import type { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { processAIJob, createBuildJobFromAI } from '../workers/ai-worker';
import { queueBuildJob } from '../workers/queue';
import { createProject as createProjectDb } from '../db/projects';
import { logger } from '../utils/logger';

/**
 * Generate project from prompt using AI
 */
export async function generateProject(req: Request, res: Response) {
  try {
    const { prompt, config, strategy } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const jobId = uuidv4();
    const projectId = uuidv4();

    logger.info(`Generating project ${projectId} from prompt`);

    // Process with AI
    const aiResult = await processAIJob(prompt, config);

    if (!aiResult.success) {
      return res.status(500).json({
        error: 'AI generation failed',
        message: aiResult.error,
      });
    }

    // Create build job from AI results
    const buildJob = createBuildJobFromAI(jobId, projectId, aiResult, strategy);

    if (!buildJob) {
      return res.status(500).json({ error: 'Failed to create build job' });
    }

    // Save project to database
    await createProjectDb({
      id: projectId,
      prompt,
      config: buildJob,
      status: 'queued',
      createdAt: new Date().toISOString(),
    });

    // Queue build job
    await queueBuildJob(buildJob);

    logger.info(`Project ${projectId} generated and build job ${jobId} queued`);

    res.status(201).json({
      projectId,
      jobId,
      status: 'queued',
      filesGenerated: aiResult.files.length,
      message: 'Project generated and build queued successfully',
    });
  } catch (error) {
    logger.error('Error generating project:', error);
    res.status(500).json({ error: 'Failed to generate project' });
  }
}
