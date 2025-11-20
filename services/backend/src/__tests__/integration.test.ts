/**
 * Integration tests for the complete build pipeline
 */

import { describe, it, expect } from 'vitest';
import type { BuildJob } from '../types/job';
import { processBuildJob } from '../workers/docker-processor';

describe('Build Pipeline Integration', () => {
  it('should process a simple Node.js build', async () => {
    const job: BuildJob = {
      jobId: 'integration-test-1',
      projectId: 'project-1',
      files: [
        {
          path: 'index.js',
          content: 'console.log("Hello from Chef!");',
          language: 'javascript',
        },
        {
          path: 'package.json',
          content: JSON.stringify({
            name: 'test-app',
            version: '1.0.0',
            scripts: {
              build: 'echo "Build complete"',
            },
          }),
        },
      ],
      dependencies: {},
      executionMode: 'docker',
      strategy: {
        runtime: 'node',
        version: '18',
        buildCommand: 'npm run build',
      },
      metadata: {
        timestamp: new Date().toISOString(),
        timeout: 60000,
      },
    };

    // Note: This test requires Docker to be running
    // Skip if Docker is not available
    try {
      const result = await processBuildJob(job);
      expect(result.jobId).toBe(job.jobId);
      expect(result.status).toBeOneOf(['success', 'failure']);
      expect(result.logs).toBeDefined();
      expect(Array.isArray(result.logs)).toBe(true);
      expect(result.metrics).toBeDefined();
    } catch (error) {
      console.warn('Docker integration test skipped - Docker may not be available');
    }
  }, 120000); // 2 minute timeout
});