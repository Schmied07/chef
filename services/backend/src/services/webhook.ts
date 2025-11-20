/**
 * Webhook service for notifying Convex
 */

import { logger } from '../utils/logger';
import { config } from '../config';

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
 * Send build complete webhook to Convex
 */
export async function sendWebhook(payload: WebhookPayload): Promise<void> {
  const webhookUrl = `${config.convex.url}/api/webhooks/build-complete`;

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': config.convex.webhookSecret,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Webhook failed with status ${response.status}`);
    }

    logger.info(`🔔 Webhook sent for job ${payload.jobId}`);
  } catch (error) {
    logger.error('Failed to send webhook:', error);
    // Don't throw - webhook failure shouldn't fail the job
  }
}