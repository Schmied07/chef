/**
 * Worker queue using BullMQ
 */

import { Queue, Worker } from 'bullmq';
import { Redis } from 'ioredis';
import { logger } from '../utils/logger';
import { processProject } from './processor';

const connection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
});

const projectQueue = new Queue('projects', { connection });

// Worker to process projects
const worker = new Worker(
  'projects',
  async (job) => {
    logger.info(`Processing project ${job.data.id}`);
    try {
      const result = await processProject(job.data);
      return result;
    } catch (error) {
      logger.error(`Error processing project ${job.data.id}:`, error);
      throw error;
    }
  },
  {
    connection,
    concurrency: parseInt(process.env.WORKER_CONCURRENCY || '5'),
  }
);

worker.on('completed', (job) => {
  logger.info(`Project ${job.data.id} completed`);
});

worker.on('failed', (job, err) => {
  logger.error(`Project ${job?.data.id} failed:`, err);
});

export async function queueProject(project: any): Promise<void> {
  await projectQueue.add('generate', project, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  });
}
