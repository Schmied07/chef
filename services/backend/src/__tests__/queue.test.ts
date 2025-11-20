/**
 * Queue tests
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getBuildQueue, queueBuildJob } from '../workers/queue';
import type { BuildJob } from '../types/job';

describe('Build Queue', () => {
  const mockJob: BuildJob = {
    jobId: 'test-job-123',
    projectId: 'test-project-123',
    files: [
      {
        path: 'index.js',
        content: 'console.log("Hello World");',
        language: 'javascript',
      },
    ],
    dependencies: {},
    executionMode: 'docker',
    strategy: {
      runtime: 'node',
      version: '18',
      installCommand: 'npm install',
      buildCommand: 'npm run build',
    },
    metadata: {
      timestamp: new Date().toISOString(),
    },
  };

  describe('getBuildQueue', () => {
    it('should initialize build queue', () => {
      const queue = getBuildQueue();
      expect(queue).toBeDefined();
      expect(queue.name).toBe('build_queue');
    });
  });

  describe('queueBuildJob', () => {
    it('should queue a build job', async () => {
      const jobId = await queueBuildJob(mockJob);
      expect(jobId).toBe(mockJob.jobId);
    });
  });
});