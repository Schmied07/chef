import { JobResult } from '../types/index.js';
import { config } from '../config/env.js';

/**
 * Send job result to Convex backend via webhook
 */
export async function sendResultToConvex(result: JobResult): Promise<void> {
  if (!config.convex.url) {
    console.warn('⚠️  CONVEX_URL not configured, skipping webhook callback');
    return;
  }

  try {
    const webhookUrl = `${config.convex.url}/api/v1/hooks/worker-result`;

    console.log(`📡 Sending result for job ${result.jobId} to Convex...`);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // TODO: Add authentication in Sprint Security
        // 'Authorization': `Bearer ${config.convex.deployKey}`
      },
      body: JSON.stringify(result),
    });

    if (!response.ok) {
      throw new Error(`Webhook failed with status ${response.status}`);
    }

    console.log(`✅ Result for job ${result.jobId} sent to Convex`);
  } catch (error) {
    console.error(`❌ Failed to send result to Convex:`, error);
    // Don't throw - we don't want to fail the job just because webhook failed
  }
}

/**
 * Send progress update to Convex
 */
export async function sendProgressToConvex(
  jobId: string,
  progress: number
): Promise<void> {
  if (!config.convex.url) {
    return;
  }

  try {
    const webhookUrl = `${config.convex.url}/api/v1/hooks/worker-progress`;

    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jobId,
        progress,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (error) {
    // Silent fail for progress updates
    console.debug(`Failed to send progress for job ${jobId}:`, error);
  }
}
