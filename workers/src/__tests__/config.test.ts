import { describe, it, expect } from 'vitest';
import { config } from '../config/env.js';

describe('Configuration', () => {
  it('should have valid Redis configuration', () => {
    expect(config.redis.host).toBeDefined();
    expect(config.redis.port).toBeGreaterThan(0);
    expect(config.redis.port).toBeLessThan(65536);
  });

  it('should have valid server configuration', () => {
    expect(config.server.port).toBeGreaterThan(0);
    expect(config.server.nodeEnv).toBeDefined();
    expect(['development', 'production', 'test']).toContain(config.server.nodeEnv);
  });

  it('should have valid worker configuration', () => {
    expect(config.worker.memoryLimit).toBeDefined();
    expect(config.worker.cpuLimit).toBeGreaterThan(0);
    expect(config.worker.timeout).toBeGreaterThan(0);
    expect(config.worker.maxConcurrent).toBeGreaterThan(0);
  });

  it('should have valid Docker configuration', () => {
    expect(config.docker.network).toBeDefined();
    expect(config.docker.network.length).toBeGreaterThan(0);
  });
});
