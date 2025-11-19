/**
 * Test Generator - Generates tests for the generated code
 */

import type { GeneratedCode, GeneratedTests } from './types';
import { callAIService } from './utils/ai-bridge';

/**
 * Generates tests for the generated code using AI
 */
export async function generateTests(
  code: GeneratedCode
): Promise<GeneratedTests> {
  try {
    const result = await callAIService('generate_tests', {
      code
    });
    
    return {
      files: result.files || [],
      coverage: result.coverage || 0,
    };
  } catch (error) {
    console.error('Error generating tests:', error);
    // Fallback to no tests
    return {
      files: [],
      coverage: 0,
    };
  }
}

/**
 * Estimates test coverage for generated tests
 */
export function estimateCoverage(tests: GeneratedTests, code: GeneratedCode): number {
  // TODO: Implement coverage estimation
  return 0;
}
