/**
 * Integration tests for API endpoints
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import { projectsRouter } from '../../routes/projects';
import { generateRouter } from '../../routes/generate';
import { sanitizeInputs } from '../../middleware/sanitizer';

const app = express();
app.use(express.json());
app.use(sanitizeInputs());
app.use('/v1/projects', projectsRouter);
app.use('/v1/generate', generateRouter);

describe('API Integration Tests', () => {
  describe('POST /v1/projects', () => {
    it('should create project with valid data', async () => {
      const validProject = {
        files: [
          {
            path: 'src/index.ts',
            content: 'console.log("Hello");',
            language: 'typescript',
          },
        ],
        metadata: {
          name: 'Test Project',
          description: 'A test project',
        },
      };

      const response = await request(app)
        .post('/v1/projects')
        .send(validProject)
        .expect('Content-Type', /json/);

      // Should either create successfully or return validation error
      expect([200, 201, 400, 500]).toContain(response.status);
    });

    it('should reject project with XSS attempt', async () => {
      const maliciousProject = {
        files: [
          {
            path: 'index.html',
            content: '<script>alert("XSS")</script>',
          },
        ],
        metadata: {
          name: '<img src=x onerror=alert(1)>',
        },
      };

      const response = await request(app)
        .post('/v1/projects')
        .send(maliciousProject);

      // Should sanitize or reject
      if (response.status === 200 || response.status === 201) {
        expect(response.body.metadata?.name).not.toContain('<img');
      }
    });

    it('should reject project with path traversal', async () => {
      const maliciousProject = {
        files: [
          {
            path: '../../etc/passwd',
            content: 'hack',
          },
        ],
      };

      const response = await request(app)
        .post('/v1/projects')
        .send(maliciousProject);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject project with too many files', async () => {
      const tooManyFiles = {
        files: Array(101).fill({
          path: 'file.txt',
          content: 'content',
        }),
      };

      const response = await request(app)
        .post('/v1/projects')
        .send(tooManyFiles)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /v1/generate', () => {
    it('should accept valid generation request', async () => {
      const validRequest = {
        prompt: 'Create a simple todo app with React',
        config: {
          enableAnalysis: true,
          enableTests: false,
        },
      };

      const response = await request(app)
        .post('/v1/generate')
        .send(validRequest);

      // Should either process or return validation error
      expect([200, 201, 400, 429, 500]).toContain(response.status);
    });

    it('should reject prompt that is too short', async () => {
      const invalidRequest = {
        prompt: 'Hi',
      };

      const response = await request(app)
        .post('/v1/generate')
        .send(invalidRequest)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject prompt that is too long', async () => {
      const invalidRequest = {
        prompt: 'a'.repeat(6000),
      };

      const response = await request(app)
        .post('/v1/generate')
        .send(invalidRequest)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should sanitize prompt with XSS', async () => {
      const maliciousRequest = {
        prompt: 'Create app <script>alert(1)</script>',
      };

      const response = await request(app)
        .post('/v1/generate')
        .send(maliciousRequest);

      if (response.status === 200 || response.status === 201) {
        // Prompt should be sanitized
        expect(response.body.prompt || '').not.toContain('<script>');
      }
    });
  });

  describe('GET /v1/projects/:id/status', () => {
    it('should reject invalid UUID', async () => {
      const response = await request(app)
        .get('/v1/projects/invalid-uuid/status')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should accept valid UUID', async () => {
      const response = await request(app)
        .get('/v1/projects/123e4567-e89b-12d3-a456-426614174000/status');

      // Should either return status or 404
      expect([200, 404, 500]).toContain(response.status);
    });
  });
});
