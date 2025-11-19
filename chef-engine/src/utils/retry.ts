import type { Logger } from './logger.js';

/**
 * Exponential backoff retry logic
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries: number;
    initialDelay: number;
    maxDelay?: number;
    logger?: Logger;
    operation?: string;
  }
): Promise<T> {
  const { maxRetries, initialDelay, maxDelay = 30000, logger, operation = 'operation' } = options;

  let lastError: Error | undefined;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        logger?.error(
          { error: lastError, attempt, operation },
          `${operation} failed after ${maxRetries} retries`
        );
        throw lastError;
      }

      const delay = Math.min(initialDelay * Math.pow(2, attempt), maxDelay);
      logger?.warn(
        { error: lastError, attempt, delay, operation },
        `${operation} failed, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`
      );
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error(`${operation} failed`);
}