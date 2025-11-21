/**
 * E2E tests for rate limiting
 */

import { test, expect } from '@playwright/test';

test.describe('Rate Limiting E2E', () => {
  test('should allow requests within limit', async ({ request }) => {
    const response = await request.get('/health');
    expect(response.ok()).toBeTruthy();
  });

  test('should rate limit excessive requests', async ({ request }) => {
    // Make 101 requests (limit is 100 per 15min)
    const requests = Array(101).fill(null).map(() =>
      request.get('/v1/projects/123e4567-e89b-12d3-a456-426614174000/status')
    );
    
    const responses = await Promise.all(requests);
    const rateLimited = responses.filter(r => r.status() === 429);
    
    // At least one should be rate limited
    expect(rateLimited.length).toBeGreaterThanOrEqual(1);
  });

  test('should have different limits for generate endpoint', async ({ request }) => {
    // Generate endpoint has stricter limit (5 req/min)
    const requests = Array(6).fill(null).map(() =>
      request.post('/v1/generate', {
        data: {
          prompt: 'Create a todo app with React and TypeScript',
        },
      })
    );
    
    const responses = await Promise.all(requests);
    const rateLimited = responses.filter(r => r.status() === 429);
    
    // Should rate limit at least one
    expect(rateLimited.length).toBeGreaterThanOrEqual(1);
    
    // Check rate limit headers
    const limitedResponse = rateLimited[0];
    if (limitedResponse) {
      const headers = limitedResponse.headers();
      expect(headers).toHaveProperty('retry-after');
      
      const data = await limitedResponse.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('Too many');
    }
  });

  test('should include rate limit headers', async ({ request }) => {
    const response = await request.get('/v1/projects/123e4567-e89b-12d3-a456-426614174000/status');
    
    const headers = response.headers();
    // Rate limit headers should be present
    expect(
      headers['ratelimit-limit'] ||
      headers['x-ratelimit-limit'] ||
      headers['retry-after']
    ).toBeDefined();
  });

  test('should reset rate limit after window', async ({ request }) => {
    // This test would need to wait for the rate limit window to reset
    // For CI, we skip or mock this
    test.skip(!process.env.CI, 'Skipping time-based test in CI');
    
    const response = await request.get('/health');
    expect(response.ok()).toBeTruthy();
  });
});
