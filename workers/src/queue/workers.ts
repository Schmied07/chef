import { Worker } from 'bullmq';
import { createRedisConnection } from '../config/redis.js';
import { processBuildJob, processTestJob, processLintJob } from './jobProcessor.js';
import { sendResultToConvex } from '../webhook/convexClient.js';
import { config } from '../config/env.js';

/**
 * Create build worker
 */
export const buildWorker = new Worker(
  'chef-builds',
  async (job) => {
    const result = await processBuildJob(job);

    // Send result to Convex via webhook
    await sendResultToConvex(result);

    return result;
  },
  {
    connection: createRedisConnection(),
    concurrency: config.worker.maxConcurrent,
    lockDuration: config.worker.timeout,
  }
);

/**
 * Create test worker
 */
export const testWorker = new Worker(
  'chef-tests',
  async (job) => {
    const result = await processTestJob(job);

    // Send result to Convex via webhook
    await sendResultToConvex(result);

    return result;
  },
  {
    connection: createRedisConnection(),
    concurrency: config.worker.maxConcurrent,
    lockDuration: config.worker.timeout,
  }
);

/**
 * Create lint worker
 */
export const lintWorker = new Worker(
  'chef-lint',
  async (job) => {
    const result = await processLintJob(job);

    // Send result to Convex via webhook
    await sendResultToConvex(result);

    return result;
  },
  {
    connection: createRedisConnection(),
    concurrency: config.worker.maxConcurrent,
    lockDuration: config.worker.timeout,
  }
);

/**
 * Setup event listeners for workers
 */
export function setupWorkerEvents(): void {
  // Build worker events
  buildWorker.on('completed', (job) => {
    console.log(`✅ Build worker completed job ${job.id}`);
  });

  buildWorker.on('failed', (job, err) => {
    console.error(`❌ Build worker failed job ${job?.id}:`, err);
  });

  buildWorker.on('error', (err) => {
    console.error('❌ Build worker error:', err);
  });

  // Test worker events
  testWorker.on('completed', (job) => {
    console.log(`✅ Test worker completed job ${job.id}`);
  });

  testWorker.on('failed', (job, err) => {
    console.error(`❌ Test worker failed job ${job?.id}:`, err);
  });

  testWorker.on('error', (err) => {
    console.error('❌ Test worker error:', err);
  });

  // Lint worker events
  lintWorker.on('completed', (job) => {
    console.log(`✅ Lint worker completed job ${job.id}`);
  });

  lintWorker.on('failed', (job, err) => {
    console.error(`❌ Lint worker failed job ${job?.id}:`, err);
  });

  lintWorker.on('error', (err) => {
    console.error('❌ Lint worker error:', err);
  });

  console.log('✅ Worker event listeners setup');
}

/**
 * Close all workers gracefully
 */
export async function closeWorkers(): Promise<void> {
  console.log('🔄 Closing workers...');

  await Promise.all([buildWorker.close(), testWorker.close(), lintWorker.close()]);

  console.log('✅ All workers closed');
}
