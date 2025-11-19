import express, { Request, Response } from 'express';
import { buildQueue, testQueue, lintQueue } from '../queue/bullmq.config.js';
import { buildJobDataSchema, testJobDataSchema, JobType, JobPriority } from '../types/index.js';
import { z } from 'zod';

const router = express.Router();

/**
 * Health check endpoint
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    // Check Redis connection
    await buildQueue.client.ping();

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      redis: 'connected',
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Create a new job
 */
router.post('/jobs', async (req: Request, res: Response) => {
  try {
    const { type, data, priority = JobPriority.NORMAL } = req.body;

    if (!type || !data) {
      return res.status(400).json({
        error: 'Missing required fields: type and data',
      });
    }

    // Validate job data based on type
    let validatedData;
    let queue;

    switch (type) {
      case JobType.BUILD:
        validatedData = buildJobDataSchema.parse(data);
        queue = buildQueue;
        break;
      case JobType.TEST:
        validatedData = testJobDataSchema.parse(data);
        queue = testQueue;
        break;
      case JobType.LINT:
      case JobType.ANALYZE:
        validatedData = data; // TODO: Add schema
        queue = lintQueue;
        break;
      default:
        return res.status(400).json({
          error: `Unknown job type: ${type}`,
        });
    }

    // Add job to queue
    const job = await queue.add(type, validatedData, {
      priority,
    });

    res.status(201).json({
      jobId: job.id,
      type,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to create job:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to create job',
    });
  }
});

/**
 * Get job status
 */
router.get('/jobs/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Try to find the job in all queues
    let job = await buildQueue.getJob(id);
    if (!job) job = await testQueue.getJob(id);
    if (!job) job = await lintQueue.getJob(id);

    if (!job) {
      return res.status(404).json({
        error: 'Job not found',
      });
    }

    const state = await job.getState();
    const progress = job.progress;

    res.json({
      jobId: job.id,
      type: job.name,
      status: state,
      progress,
      data: job.data,
      createdAt: new Date(job.timestamp).toISOString(),
      finishedAt: job.finishedOn ? new Date(job.finishedOn).toISOString() : null,
    });
  } catch (error) {
    console.error('Failed to get job:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to get job',
    });
  }
});

/**
 * Get queue statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const [buildCounts, testCounts, lintCounts] = await Promise.all([
      buildQueue.getJobCounts(),
      testQueue.getJobCounts(),
      lintQueue.getJobCounts(),
    ]);

    res.json({
      timestamp: new Date().toISOString(),
      queues: {
        builds: buildCounts,
        tests: testCounts,
        lint: lintCounts,
      },
    });
  } catch (error) {
    console.error('Failed to get stats:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to get stats',
    });
  }
});

export default router;
