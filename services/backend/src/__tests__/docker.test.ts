/**
 * Docker service tests
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { checkDockerHealth, getDockerImage } from '../services/docker';

describe('Docker Service', () => {
  describe('checkDockerHealth', () => {
    it('should check Docker health', async () => {
      const isHealthy = await checkDockerHealth();
      expect(typeof isHealthy).toBe('boolean');
    });
  });

  describe('getDockerImage', () => {
    it('should return correct Node.js image', () => {
      const image = getDockerImage({
        runtime: 'node',
        version: '18',
      });
      expect(image).toBe('node:18-alpine');
    });

    it('should return correct Python image', () => {
      const image = getDockerImage({
        runtime: 'python',
        version: '3.11',
      });
      expect(image).toBe('python:3.11-slim');
    });

    it('should use default version if not specified', () => {
      const image = getDockerImage({
        runtime: 'node',
        version: '',
      });
      expect(image).toBe('node:18-alpine');
    });
  });
});