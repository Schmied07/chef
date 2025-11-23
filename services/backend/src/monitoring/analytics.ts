/**
 * Usage Analytics Tracking
 * Self-hosted PostHog integration
 */

import { PostHog } from 'posthog-node';
import { logger } from '../utils/logger';
import { getEnv } from '../config/env';

let posthog: PostHog | null = null;

/**
 * Initialize PostHog client
 */
export function initAnalytics(): void {
  const POSTHOG_API_KEY = process.env.POSTHOG_API_KEY;
  const POSTHOG_HOST = process.env.POSTHOG_HOST || 'https://app.posthog.com';
  const ANALYTICS_ENABLED = process.env.ENABLE_ANALYTICS === 'true';

  if (!ANALYTICS_ENABLED) {
    logger.info('⚠️  Analytics disabled (ENABLE_ANALYTICS=false)');
    return;
  }

  if (!POSTHOG_API_KEY) {
    logger.warn('⚠️  PostHog API key not configured - analytics disabled');
    return;
  }

  try {
    posthog = new PostHog(POSTHOG_API_KEY, {
      host: POSTHOG_HOST,
      flushAt: 20, // Flush after 20 events
      flushInterval: 10000, // Flush every 10 seconds
    });

    logger.info('✅ Analytics initialized (PostHog)');
  } catch (error) {
    logger.error('Failed to initialize analytics:', error);
  }
}

/**
 * Track an event
 */
export function trackEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, any>
): void {
  if (!posthog) {
    return;
  }

  try {
    posthog.capture({
      distinctId,
      event,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('Failed to track event:', error);
  }
}

/**
 * Track template selection
 */
export function trackTemplateSelected(
  userId: string,
  template: string,
  features?: string[]
): void {
  trackEvent(userId, 'template_selected', {
    template,
    features,
  });
}

/**
 * Track build start
 */
export function trackBuildStarted(
  userId: string,
  projectId: string,
  template: string
): void {
  trackEvent(userId, 'build_started', {
    projectId,
    template,
  });
}

/**
 * Track build completion
 */
export function trackBuildCompleted(
  userId: string,
  projectId: string,
  template: string,
  durationMs: number,
  success: boolean
): void {
  trackEvent(userId, 'build_completed', {
    projectId,
    template,
    duration_ms: durationMs,
    success,
  });
}

/**
 * Track preview opened
 */
export function trackPreviewOpened(
  userId: string,
  projectId: string
): void {
  trackEvent(userId, 'preview_opened', {
    projectId,
  });
}

/**
 * Track error
 */
export function trackError(
  userId: string,
  errorType: string,
  errorMessage: string,
  context?: Record<string, any>
): void {
  trackEvent(userId, 'error_occurred', {
    error_type: errorType,
    error_message: errorMessage,
    ...context,
  });
}

/**
 * Identify user
 */
export function identifyUser(
  userId: string,
  properties?: Record<string, any>
): void {
  if (!posthog) {
    return;
  }

  try {
    posthog.identify({
      distinctId: userId,
      properties,
    });
  } catch (error) {
    logger.error('Failed to identify user:', error);
  }
}

/**
 * Flush all pending events
 */
export async function flushAnalytics(): Promise<void> {
  if (!posthog) {
    return;
  }

  try {
    await posthog.shutdown();
  } catch (error) {
    logger.error('Failed to flush analytics:', error);
  }
}

/**
 * Get analytics stats
 */
export function getAnalyticsStats(): object {
  return {
    enabled: posthog !== null,
    provider: 'posthog',
    host: process.env.POSTHOG_HOST || 'https://app.posthog.com',
  };
}
