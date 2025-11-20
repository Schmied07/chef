/**
 * Redis service tests
 */

import { describe, it, expect } from 'vitest';
import { checkRedisHealth } from '../services/redis';

describe('Redis Service', () => {
  describe('checkRedisHealth', () => {
    it('should check Redis health', async () => {
      const isHealthy = await checkRedisHealth();
      expect(typeof isHealthy).toBe('boolean');
    });
  });
});