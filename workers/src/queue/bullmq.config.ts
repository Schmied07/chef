import { Queue, Worker, QueueEvents } from 'bullmq';
import { createRedisConnection } from '../config/redis.js';
import { JobType, JobPriority } from '../types/index.js';

/**
 * BullMQ Queue configuration
 */
const queueOptions = {
  connection: createRedisConnection(),
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: {
      count: 100, // Keep last 100 completed jobs
      age: 3600, // Keep for 1 hour
    },
    removeOnFail: {
      count: 500, // Keep last 500 failed jobs
    },
  },
};

/**
 * Create job queue for build tasks
 */
export const buildQueue = new Queue('chef-builds', queueOptions);

/**
 * Create job queue for test tasks
 */
export const testQueue = new Queue('chef-tests', queueOptions);

/**
 * Create job queue for lint/analysis tasks
 */
export const lintQueue = new Queue('chef-lint', queueOptions);

/**
 * Queue events for monitoring
 */
export const buildQueueEvents = new QueueEvents('chef-builds', {
  connection: createRedisConnection(),
});

export const testQueueEvents = new QueueEvents('chef-tests', {
  connection: createRedisConnection(),
});

export const lintQueueEvents = new QueueEvents('chef-lint', {
  connection: createRedisConnection(),
});

/**
 * Get queue by job type
 */
export function getQueueByType(type: JobType): Queue {
  switch (type) {
    case JobType.BUILD:
      return buildQueue;
    case JobType.TEST:
      return testQueue;
    case JobType.LINT:
    case JobType.ANALYZE:
      return lintQueue;
    default:
      throw new Error(`Unknown job type: ${type}`);
  }
}

/**
 * Initialize all queues
 */
export async function initializeQueues(): Promise<void> {
  console.log('🚀 Initializing BullMQ queues...');

  try {
    // Test connections
    await buildQueue.client.ping();
    await testQueue.client.ping();
    await lintQueue.client.ping();

    console.log('✅ All queues initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize queues:', error);
    throw error;
  }
}

/**
 * Close all queues gracefully
 */
export async function closeQueues(): Promise<void> {
  console.log('🔄 Closing queues...');

  await Promise.all([
    buildQueue.close(),
    testQueue.close(),
    lintQueue.close(),
    buildQueueEvents.close(),
    testQueueEvents.close(),
    lintQueueEvents.close(),
  ]);

  console.log('✅ All queues closed');
}
