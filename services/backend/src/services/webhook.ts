/**
 * Webhook service for notifying Convex with retry support
 */

import { logger } from '../utils/logger';
import { config } from '../config';
import { queueWebhookWithRetry } from './webhook-retry';

interface WebhookPayload {
  jobId: string;
  projectId: string;
  status: 'success' | 'failure';
  logs: any[];
  artifacts?: any[];
  metrics: any;
  error?: string;
}

/**
 * Send build complete webhook to Convex with retry support
 */
export async function sendWebhook(payload: WebhookPayload): Promise<void> {
  const webhookUrl = `${config.convex.url}/api/webhooks/build-complete`;

  const headers = {
    'Content-Type': 'application/json',
    'X-Webhook-Secret': config.convex.webhookSecret,
  };

  try {
    await queueWebhookWithRetry(webhookUrl, payload, headers);
    logger.info(`🔔 Webhook queued for job ${payload.jobId}`);
  } catch (error) {
    logger.error('Failed to queue webhook:', error);
    // Don't throw - webhook failure shouldn't fail the job
  }
}