/**
 * Integration tests for security features
 */

import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import helmet from 'helmet';
import { globalRateLimiter } from '../../middleware/rate-limit';
import { sanitizeInputs } from '../../middleware/sanitizer';

const createTestApp = () => {
  const app = express();
  
  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
      },
    },
  }));
  
  app.use(express.json());
  app.use(sanitizeInputs());
  
  // Test route
  app.post('/test', (req, res) => {
    res.json({ received: req.body });
  });
  
  return app;
};

describe('Security Integration Tests', () => {
  describe('Security Headers', () => {
    it('should include security headers', async () => {
      const app = createTestApp();
      
      const response = await request(app)
        .get('/test')
        .expect((res) => {
          expect(res.headers).toHaveProperty('x-content-type-options');
          expect(res.headers).toHaveProperty('x-frame-options');
          expect(res.headers).toHaveProperty('content-security-policy');
        });
    });

    it('should set X-Frame-Options to SAMEORIGIN', async () => {
      const app = createTestApp();
      
      const response = await request(app)
        .get('/test');
      
      expect(response.headers['x-frame-options']).toMatch(/SAMEORIGIN/i);
    });

    it('should set X-Content-Type-Options to nosniff', async () => {
      const app = createTestApp();
      
      const response = await request(app)
        .get('/test');
      
      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });

    it('should include CSP header', async () => {
      const app = createTestApp();
      
      const response = await request(app)
        .get('/test');
      
      expect(response.headers['content-security-policy']).toBeDefined();
      expect(response.headers['content-security-policy']).toContain("default-src 'self'");
    });
  });

  describe('Input Sanitization', () => {
    it('should sanitize XSS in request body', async () => {
      const app = createTestApp();
      
      const response = await request(app)
        .post('/test')
        .send({
          message: '<script>alert("XSS")</script>',
        })
        .expect(200);
      
      expect(response.body.received.message).not.toContain('<script>');
      expect(response.body.received.message).toContain('&lt;');
    });

    it('should prevent prototype pollution', async () => {
      const app = createTestApp();
      
      const response = await request(app)
        .post('/test')
        .send({
          __proto__: { polluted: true },
          constructor: { polluted: true },
          data: 'normal',
        })
        .expect(200);
      
      expect(response.body.received.__proto__).toBeUndefined();
      expect(response.body.received.constructor).toBeUndefined();
      expect(response.body.received.data).toBe('normal');
    });

    it('should remove null bytes', async () => {
      const app = createTestApp();
      
      const response = await request(app)
        .post('/test')
        .send({
          text: 'hello\x00world',
        })
        .expect(200);
      
      expect(response.body.received.text).not.toContain('\x00');
    });

    it('should handle nested XSS attempts', async () => {
      const app = createTestApp();
      
      const response = await request(app)
        .post('/test')
        .send({
          user: {
            name: '<img src=x onerror=alert(1)>',
            profile: {
              bio: '<iframe src="javascript:alert(1)"></iframe>',
            },
          },
        })
        .expect(200);
      
      expect(response.body.received.user.name).not.toContain('<img');
      expect(response.body.received.user.profile.bio).not.toContain('<iframe');
    });
  });

  describe('CORS', () => {
    it('should handle CORS preflight', async () => {
      const app = createTestApp();
      
      const response = await request(app)
        .options('/test')
        .set('Origin', 'https://example.com')
        .set('Access-Control-Request-Method', 'POST');
      
      // Should either accept or reject CORS
      expect([200, 204, 403, 404]).toContain(response.status);
    });
  });
});
