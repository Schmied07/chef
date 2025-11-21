/**
 * Webhook retry service with exponential backoff
 */

import { Queue, Worker, Job } from 'bullmq';
import { getRedisClient } from './redis';
import { logger } from '../utils/logger';
import { config } from '../config';

const WEBHOOK_RETRY_QUEUE = 'webhook_retry_queue';

let webhookRetryQueue: Queue | null = null;
let webhookRetryWorker: Worker | null = null;

export interface WebhookPayload {
  url: string;
  data: any;
  headers?: Record<string, string>;
  attempt?: number;
}

/**
 * Initialize webhook retry queue
 */
export function getWebhookRetryQueue(): Queue {
  if (!webhookRetryQueue) {
    const connection = getRedisClient();
    webhookRetryQueue = new Queue(WEBHOOK_RETRY_QUEUE, { connection });

    webhookRetryQueue.on('error', (error) => {
      logger.error('Webhook retry queue error:', error);
    });

    logger.info('✅ Webhook retry queue initialized');
  }

  return webhookRetryQueue;
}

/**
 * Start webhook retry worker
 */
export function startWebhookRetryWorker(): void {
  if (webhookRetryWorker) {
    logger.warn('Webhook retry worker already started');
    return;
  }

  const connection = getRedisClient();
  const maxRetries = parseInt(process.env.WEBHOOK_MAX_RETRIES || '3');

  webhookRetryWorker = new Worker(
    WEBHOOK_RETRY_QUEUE,
    async (job: Job<WebhookPayload>) => {
      const { url, data, headers, attempt = 1 } = job.data;

      logger.info(`🔄 Attempting webhook delivery (attempt ${attempt}/${maxRetries}): ${url}`);

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error(`Webhook returned status ${response.status}`);
        }

        logger.info(`✅ Webhook delivered successfully: ${url}`);
        return { success: true, attempt };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`❌ Webhook delivery failed (attempt ${attempt}): ${errorMessage}`);

        // Re-throw to trigger retry
        throw error;
      }
    },
    {
      connection,
      concurrency: 5,
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 500 },
    }
  );

  webhookRetryWorker.on('completed', (job) => {
    logger.info(`✅ Webhook job ${job.id} completed`);
  });

  webhookRetryWorker.on('failed', (job, err) => {
    logger.error(`❌ Webhook job ${job?.id} failed after all retries:`, err.message);
  });

  logger.info('⚙️ Webhook retry worker started');
}

/**
 * Stop webhook retry worker
 */
export async function stopWebhookRetryWorker(): Promise<void> {
  if (webhookRetryWorker) {
    await webhookRetryWorker.close();
    webhookRetryWorker = null;
    logger.info('Webhook retry worker stopped');
  }
}

/**
 * Queue a webhook for delivery with retry
 */
export async function queueWebhookWithRetry(
  url: string,
  data: any,
  headers?: Record<string, string>
): Promise<string> {
  const retryEnabled = process.env.WEBHOOK_RETRY_ENABLED === 'true';

  if (!retryEnabled) {
    // Direct delivery without retry
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Webhook returned status ${response.status}`);
      }

      logger.info(`✅ Webhook delivered (no retry): ${url}`);
      return 'direct';
    } catch (error) {
      logger.error('Webhook delivery failed (no retry):', error);
      throw error;
    }
  }

  // Queue with retry
  const queue = getWebhookRetryQueue();
  const maxRetries = parseInt(process.env.WEBHOOK_MAX_RETRIES || '3');
  const retryDelay = parseInt(process.env.WEBHOOK_RETRY_DELAY || '5000');

  const job = await queue.add(
    'webhook',
    { url, data, headers, attempt: 1 },
    {
      attempts: maxRetries,
      backoff: {
        type: 'exponential',
        delay: retryDelay,
      },
      removeOnComplete: true,
      removeOnFail: false,
    }
  );

  logger.info(`📥 Webhook queued with retry: ${url}`);
  return job.id || 'queued';
}

/**
 * Get webhook retry queue stats
 */
export async function getWebhookRetryStats() {
  const queue = getWebhookRetryQueue();

  const [waiting, active, completed, failed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
  ]);

  return {
    waiting,
    active,
    completed,
    failed,
    total: waiting + active + completed + failed,
  };
}
