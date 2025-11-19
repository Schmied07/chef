/**
 * Code Generator - Generates code from plans and prompts
 */

import type { GenerationPlan, GeneratedCode } from './types';
import { callAIService } from './utils/ai-bridge';

/**
 * Generates code based on a plan using AI
 */
export async function generateCode(
  plan: GenerationPlan,
  prompt: string
): Promise<GeneratedCode> {
  try {
    const result = await callAIService('generate_code', {
      plan,
      context: prompt
    });
    
    return {
      files: result.files || [],
      dependencies: result.dependencies || {},
      metadata: {
        framework: result.metadata?.framework || 'react',
        template: result.metadata?.template || 'react-convex',
        features: result.metadata?.features || [],
        createdAt: new Date(result.metadata?.createdAt || Date.now()),
      },
    };
  } catch (error) {
    console.error('Error generating code:', error);
    // Fallback to empty code structure
    return {
      files: [],
      dependencies: {},
      metadata: {
        framework: 'react',
        template: 'react-convex',
        features: [],
        createdAt: new Date(),
      },
    };
  }
}

/**
 * Validates generated code for basic correctness
 */
export function validateCode(code: GeneratedCode): boolean {
  return code.files.length > 0;
}
