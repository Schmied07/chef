/**
 * Unit tests for environment configuration
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { loadEnv, getEnv, hasSecret, getSecret } from '../../config/env';

describe('Environment Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should load valid environment variables', () => {
    process.env.REDIS_HOST = 'localhost';
    process.env.REDIS_PORT = '6379';
    process.env.NODE_ENV = 'development';

    expect(() => loadEnv()).not.toThrow();
    const config = getEnv();
    expect(config.REDIS_HOST).toBe('localhost');
    expect(config.REDIS_PORT).toBe(6379);
  });

  it('should fail if required variable is missing', () => {
    delete process.env.REDIS_HOST;

    expect(() => loadEnv()).toThrow('Invalid environment configuration');
  });

  it('should apply default values', () => {
    process.env.REDIS_HOST = 'localhost';
    delete process.env.PORT;

    loadEnv();
    const config = getEnv();
    expect(config.PORT).toBe(3001);
  });

  it('should transform string booleans', () => {
    process.env.REDIS_HOST = 'localhost';
    process.env.WEBSOCKET_ENABLED = 'true';
    process.env.HELMET_ENABLED = 'false';

    loadEnv();
    const config = getEnv();
    expect(config.WEBSOCKET_ENABLED).toBe(true);
    expect(config.HELMET_ENABLED).toBe(false);
  });

  it('should transform string numbers', () => {
    process.env.REDIS_HOST = 'localhost';
    process.env.PORT = '8080';
    process.env.RATE_LIMIT_MAX_REQUESTS = '200';

    loadEnv();
    const config = getEnv();
    expect(config.PORT).toBe(8080);
    expect(config.RATE_LIMIT_MAX_REQUESTS).toBe(200);
  });

  it('should check if secret exists', () => {
    process.env.REDIS_HOST = 'localhost';
    process.env.OPENAI_API_KEY = 'sk-test';

    loadEnv();
    expect(hasSecret('OPENAI_API_KEY')).toBe(true);
    expect(hasSecret('ANTHROPIC_API_KEY')).toBe(false);
  });

  it('should get secret value', () => {
    process.env.REDIS_HOST = 'localhost';
    process.env.OPENAI_API_KEY = 'sk-test';

    loadEnv();
    expect(getSecret('OPENAI_API_KEY')).toBe('sk-test');
  });

  it('should throw if getting missing secret', () => {
    process.env.REDIS_HOST = 'localhost';

    loadEnv();
    expect(() => getSecret('ANTHROPIC_API_KEY')).toThrow('not configured');
  });
});
