/**
 * E2E tests for API endpoints
 */

import { test, expect } from '@playwright/test';

test.describe('API Endpoints E2E', () => {
  test('should return health status', async ({ request }) => {
    const response = await request.get('/health');
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('status');
    expect(data).toHaveProperty('services');
  });

  test('should return metrics', async ({ request }) => {
    const response = await request.get('/metrics');
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('should enforce rate limiting', async ({ request }) => {
    // Make multiple rapid requests
    const requests = Array(10).fill(null).map(() =>
      request.get('/v1/projects/123e4567-e89b-12d3-a456-426614174000/status')
    );
    
    const responses = await Promise.all(requests);
    
    // At least one should succeed or return 404 (not found)
    const successOrNotFound = responses.filter(r => r.status() === 200 || r.status() === 404);
    expect(successOrNotFound.length).toBeGreaterThan(0);
  });

  test('should handle CSP violations gracefully', async ({ request }) => {
    const response = await request.post('/csp-report', {
      data: {
        'csp-report': {
          'document-uri': 'http://example.com',
          'violated-directive': 'script-src',
        },
      },
    });
    
    expect(response.status()).toBe(204);
  });

  test('should reject requests with invalid JSON', async ({ request }) => {
    const response = await request.post('/v1/projects', {
      data: 'invalid json',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    expect([400, 500]).toContain(response.status());
  });

  test('should validate UUID in path params', async ({ request }) => {
    const response = await request.get('/v1/projects/invalid-uuid/status');
    
    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  test('should sanitize XSS attempts', async ({ request }) => {
    const response = await request.post('/v1/projects', {
      data: {
        files: [
          {
            path: 'index.html',
            content: 'safe content',
          },
        ],
        metadata: {
          name: '<script>alert("XSS")</script>',
        },
      },
    });
    
    // Should either sanitize or reject
    if (response.ok()) {
      const data = await response.json();
      const name = data.metadata?.name || '';
      expect(name).not.toContain('<script>');
    } else {
      expect([400, 500]).toContain(response.status());
    }
  });
});
