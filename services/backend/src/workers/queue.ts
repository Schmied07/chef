/**
 * Worker queue using BullMQ with Docker processor
 */

import { Queue, Worker, Job } from 'bullmq';
import { getRedisClient } from '../services/redis';
import { logger } from '../utils/logger';
import { processBuildJob } from './docker-processor';
import { sendWebhook } from '../services/webhook';
import { config } from '../config';
import type { BuildJob, BuildResult, JobPriority } from '../types/job';

const QUEUE_NAME = 'build_queue';
const DLQ_NAME = 'build_queue_dead_letter';

let buildQueue: Queue<BuildJob> | null = null;
let deadLetterQueue: Queue<BuildJob> | null = null;
let worker: Worker<BuildJob, BuildResult> | null = null;

// Priority mapping for BullMQ (higher number = higher priority)
const PRIORITY_MAP: Record<JobPriority, number> = {
  critical: 1,
  high: 2,
  normal: 3,
  low: 4,
};

/**
 * Initialize the build queue
 */
export function getBuildQueue(): Queue<BuildJob> {
  if (!buildQueue) {
    const connection = getRedisClient();
    buildQueue = new Queue<BuildJob>(QUEUE_NAME, { connection });

    buildQueue.on('error', (error) => {
      logger.error('Build queue error:', error);
    });

    logger.info('✅ Build queue initialized');
  }

  return buildQueue;
}

/**
 * Initialize the dead letter queue
 */
export function getDeadLetterQueue(): Queue<BuildJob> {
  if (!deadLetterQueue) {
    const connection = getRedisClient();
    deadLetterQueue = new Queue<BuildJob>(DLQ_NAME, { connection });

    deadLetterQueue.on('error', (error) => {
      logger.error('Dead letter queue error:', error);
    });

    logger.info('✅ Dead letter queue initialized');
  }

  return deadLetterQueue;
}

/**
 * Start the worker to process build jobs
 */
export function startWorker(): void {
  if (worker) {
    logger.warn('Worker already started');
    return;
  }

  const connection = getRedisClient();

  worker = new Worker<BuildJob, BuildResult>(
    QUEUE_NAME,
    async (job: Job<BuildJob>) => {
      logger.info(`⚙️ Processing build job ${job.data.jobId}`);

      try {
        // Update job progress
        await job.updateProgress({
          status: 'processing',
          progress: 5,
          message: 'Job picked up by worker',
        });

        // Process the build using Docker
        const result = await processBuildJob(job.data);

        // Send webhook to Convex with result
        await sendWebhook({
          jobId: job.data.jobId,
          projectId: job.data.projectId,
          status: result.status,
          logs: result.logs,
          artifacts: result.artifacts,
          metrics: result.metrics,
          error: result.error,
        });

        logger.info(`✅ Build job ${job.data.jobId} completed`);
        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`❌ Build job ${job.data.jobId} failed:`, error);

        // Send failure webhook
        await sendWebhook({
          jobId: job.data.jobId,
          projectId: job.data.projectId,
          status: 'failure',
          logs: [],
          error: errorMessage,
          metrics: {
            startTime: new Date().toISOString(),
            endTime: new Date().toISOString(),
            duration: 0,
          },
        });

        throw error;
      }
    },
    {
      connection,
      concurrency: config.worker.concurrency,
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 500 },
    }
  );

  // Worker event handlers
  worker.on('completed', (job) => {
    logger.info(`✅ Job ${job.id} completed successfully`);
  });

  worker.on('failed', async (job, err) => {
    logger.error(`❌ Job ${job?.id} failed:`, err.message);
    
    // Move to dead letter queue after all retries exhausted
    if (job && job.attemptsMade >= (job.opts.attempts || 3)) {
      try {
        const dlq = getDeadLetterQueue();
        await dlq.add('failed_job', job.data, {
          jobId: `dlq_${job.data.jobId}`,
          priority: PRIORITY_MAP[job.data.priority || 'normal'],
        });
        logger.info(`📮 Job ${job.id} moved to dead letter queue`);
      } catch (error) {
        logger.error('Failed to move job to DLQ:', error);
      }
    }
  });

  worker.on('progress', (job, progress) => {
    logger.info(`⏳ Job ${job.id} progress:`, progress);
  });

  worker.on('error', (error) => {
    logger.error('Worker error:', error);
  });

  logger.info(`⚙️ Worker started with concurrency ${config.worker.concurrency}`);
}

/**
 * Stop the worker
 */
export async function stopWorker(): Promise<void> {
  if (worker) {
    await worker.close();
    worker = null;
    logger.info('Worker stopped');
  }
}

/**
 * Add a build job to the queue
 */
export async function queueBuildJob(job: BuildJob): Promise<string> {
  const queue = getBuildQueue();
  const priority = job.priority || 'normal';

  const bullJob = await queue.add('build', job, {
    jobId: job.jobId,
    priority: PRIORITY_MAP[priority],
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  });

  logger.info(`📥 Build job ${job.jobId} queued with priority: ${priority}`);
  return bullJob.id || job.jobId;
}

/**
 * Get job status
 */
export async function getJobStatus(jobId: string) {
  const queue = getBuildQueue();
  const job = await queue.getJob(jobId);

  if (!job) {
    return null;
  }

  const state = await job.getState();
  const progress = job.progress;

  return {
    id: job.id,
    state,
    progress,
    data: job.data,
    returnvalue: job.returnvalue,
    failedReason: job.failedReason,
  };
}