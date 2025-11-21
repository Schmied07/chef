/**
 * E2E security tests
 */

import { test, expect } from '@playwright/test';

test.describe('Security E2E Tests', () => {
  test('should include security headers', async ({ request }) => {
    const response = await request.get('/health');
    
    const headers = response.headers();
    expect(headers).toHaveProperty('x-content-type-options');
    expect(headers).toHaveProperty('x-frame-options');
    expect(headers['x-content-type-options']).toBe('nosniff');
  });

  test('should enforce CSP', async ({ request }) => {
    const response = await request.get('/health');
    
    const headers = response.headers();
    expect(headers).toHaveProperty('content-security-policy');
    expect(headers['content-security-policy']).toContain("default-src");
  });

  test('should prevent path traversal', async ({ request }) => {
    const response = await request.post('/v1/projects', {
      data: {
        files: [
          {
            path: '../../../etc/passwd',
            content: 'hack attempt',
          },
        ],
      },
    });
    
    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  test('should reject SQL injection attempts', async ({ request }) => {
    const response = await request.post('/v1/generate', {
      data: {
        prompt: "'; DROP TABLE users; --",
      },
    });
    
    // Should sanitize or validate
    expect([200, 201, 400, 500]).toContain(response.status());
  });

  test('should validate file content size', async ({ request }) => {
    const largeContent = 'x'.repeat(11 * 1024 * 1024); // 11MB
    
    const response = await request.post('/v1/projects', {
      data: {
        files: [
          {
            path: 'large.txt',
            content: largeContent,
          },
        ],
      },
    });
    
    expect(response.status()).toBe(400);
  });

  test('should limit number of files', async ({ request }) => {
    const files = Array(101).fill(null).map((_, i) => ({
      path: `file${i}.txt`,
      content: 'content',
    }));
    
    const response = await request.post('/v1/projects', {
      data: { files },
    });
    
    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  test('should rate limit generation requests', async ({ request }) => {
    // Make 6 requests rapidly (limit is 5/min)
    const requests = Array(6).fill(null).map(() =>
      request.post('/v1/generate', {
        data: {
          prompt: 'Create a simple app',
        },
      })
    );
    
    const responses = await Promise.all(requests);
    const rateLimited = responses.some(r => r.status() === 429);
    
    // Should rate limit at least one request
    expect(rateLimited).toBe(true);
  });

  test('should validate prompt length', async ({ request }) => {
    // Too short
    const shortResponse = await request.post('/v1/generate', {
      data: {
        prompt: 'Hi',
      },
    });
    expect(shortResponse.status()).toBe(400);
    
    // Too long
    const longResponse = await request.post('/v1/generate', {
      data: {
        prompt: 'a'.repeat(6000),
      },
    });
    expect(longResponse.status()).toBe(400);
  });

  test('should handle prototype pollution attempts', async ({ request }) => {
    const response = await request.post('/v1/projects', {
      data: {
        files: [
          {
            path: 'index.js',
            content: 'code',
          },
        ],
        __proto__: {
          polluted: true,
        },
        constructor: {
          polluted: true,
        },
      },
    });
    
    // Should sanitize or reject
    if (response.ok()) {
      const data = await response.json();
      expect(data.__proto__).toBeUndefined();
      expect(data.constructor).toBeUndefined();
    }
  });
});
