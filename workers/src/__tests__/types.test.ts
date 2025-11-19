import { describe, it, expect } from 'vitest';
import { buildJobDataSchema, testJobDataSchema, jobResultSchema, JobStatus, JobType, JobPriority } from '../types/index.js';

describe('Type Schemas', () => {
  describe('buildJobDataSchema', () => {
    it('should validate correct build job data', () => {
      const validData = {
        chatId: 'chat-123',
        projectFiles: {
          'index.js': 'console.log("Hello");',
        },
      };

      const result = buildJobDataSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid build job data', () => {
      const invalidData = {
        chatId: 'chat-123',
        // missing projectFiles
      };

      const result = buildJobDataSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('testJobDataSchema', () => {
    it('should validate correct test job data', () => {
      const validData = {
        chatId: 'test-456',
        projectFiles: {
          'test.js': 'it("works", () => {});',
        },
      };

      const result = testJobDataSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should use default test command', () => {
      const data = {
        chatId: 'test-456',
        projectFiles: {},
      };

      const result = testJobDataSchema.parse(data);
      expect(result.testCommand).toBe('npm test');
    });
  });

  describe('jobResultSchema', () => {
    it('should validate correct job result', () => {
      const validResult = {
        jobId: 'job-789',
        status: JobStatus.COMPLETED,
        output: 'Build successful',
        logs: ['Starting...', 'Done!'],
        duration: 5000,
        timestamp: new Date().toISOString(),
      };

      const result = jobResultSchema.safeParse(validResult);
      expect(result.success).toBe(true);
    });

    it('should validate failed job result', () => {
      const validResult = {
        jobId: 'job-999',
        status: JobStatus.FAILED,
        error: 'Build failed',
        timestamp: new Date().toISOString(),
      };

      const result = jobResultSchema.safeParse(validResult);
      expect(result.success).toBe(true);
    });
  });

  describe('Enums', () => {
    it('should have correct JobType values', () => {
      expect(JobType.BUILD).toBe('build');
      expect(JobType.TEST).toBe('test');
      expect(JobType.LINT).toBe('lint');
      expect(JobType.ANALYZE).toBe('analyze');
    });

    it('should have correct JobStatus values', () => {
      expect(JobStatus.PENDING).toBe('pending');
      expect(JobStatus.PROCESSING).toBe('processing');
      expect(JobStatus.COMPLETED).toBe('completed');
      expect(JobStatus.FAILED).toBe('failed');
      expect(JobStatus.TIMEOUT).toBe('timeout');
    });

    it('should have correct JobPriority values', () => {
      expect(JobPriority.LOW).toBe(1);
      expect(JobPriority.NORMAL).toBe(5);
      expect(JobPriority.HIGH).toBe(10);
      expect(JobPriority.CRITICAL).toBe(20);
    });
  });
});
