/**
 * Pipeline tests
 */

import { describe, it, expect } from 'vitest';
import { runPipeline } from '../pipeline';
import type { UserPrompt } from '../types';

describe('Pipeline', () => {
  it('should run complete pipeline', async () => {
    const prompt: UserPrompt = {
      text: 'Build a simple todo app',
      timestamp: new Date(),
    };

    const result = await runPipeline(prompt, {
      enableAnalysis: false,
      enableTests: false,
      enableExecution: false,
    });

    expect(result).toBeDefined();
    expect(result.intent).toBeDefined();
    expect(result.plan).toBeDefined();
    expect(result.code).toBeDefined();
  });

  it('should handle errors gracefully', async () => {
    const prompt: UserPrompt = {
      text: '',
      timestamp: new Date(),
    };

    const result = await runPipeline(prompt);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
