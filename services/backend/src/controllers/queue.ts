/**
 * Queue monitoring controllers
 */

import type { Request, Response } from 'express';
import {
  getQueueStats,
  getDeadLetterJobs,
  retryDeadLetterJob,
  clearDeadLetterQueue,
} from '../workers/queue';
import { logger } from '../utils/logger';

/**
 * Get queue statistics
 * GET /v1/queue/stats
 */
export async function getQueueStatistics(req: Request, res: Response) {
  try {
    const stats = await getQueueStats();
    res.json({
      success: true,
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error getting queue stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get queue statistics',
    });
  }
}

/**
 * Get dead letter queue jobs
 * GET /v1/queue/dead-letter
 */
export async function getDeadLetterQueueJobs(req: Request, res: Response) {
  try {
    const start = parseInt(req.query.start as string) || 0;
    const end = parseInt(req.query.end as string) || 10;
    
    const jobs = await getDeadLetterJobs(start, end);
    res.json({
      success: true,
      jobs,
      count: jobs.length,
    });
  } catch (error) {
    logger.error('Error getting DLQ jobs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get dead letter queue jobs',
    });
  }
}

/**
 * Retry a job from dead letter queue
 * POST /v1/queue/dead-letter/:jobId/retry
 */
export async function retryDeadLetterJobController(req: Request, res: Response) {
  try {
    const { jobId } = req.params;
    const newJobId = await retryDeadLetterJob(jobId);

    if (!newJobId) {
      return res.status(404).json({
        success: false,
        error: 'Job not found in dead letter queue',
      });
    }

    res.json({
      success: true,
      message: 'Job requeued successfully',
      newJobId,
    });
  } catch (error) {
    logger.error('Error retrying DLQ job:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retry job',
    });
  }
}

/**
 * Clear dead letter queue
 * DELETE /v1/queue/dead-letter
 */
export async function clearDeadLetterQueueController(req: Request, res: Response) {
  try {
    const count = await clearDeadLetterQueue();
    res.json({
      success: true,
      message: `Cleared ${count} jobs from dead letter queue`,
      count,
    });
  } catch (error) {
    logger.error('Error clearing DLQ:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear dead letter queue',
    });
  }
}
