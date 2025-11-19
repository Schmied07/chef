/**
 * Intent Extractor - Extracts user intent from natural language prompts
 */

import type { UserPrompt, ExtractedIntent } from './types';
import { callAIService } from './utils/ai-bridge';

/**
 * Extracts structured intent from a user prompt using AI
 */
export async function extractIntent(
  prompt: UserPrompt
): Promise<ExtractedIntent> {
  try {
    const result = await callAIService('extract_intent', {
      prompt: prompt.text
    });
    
    return {
      purpose: result.purpose || 'Application',
      features: result.features || [],
      techStack: result.techStack || [],
      constraints: result.constraints || [],
    };
  } catch (error) {
    console.error('Error extracting intent:', error);
    // Fallback to basic extraction
    return {
      purpose: prompt.text.substring(0, 100),
      features: [],
      techStack: ['react', 'typescript'],
      constraints: [],
    };
  }
}

/**
 * Validates if an intent is well-formed and actionable
 */
export function validateIntent(intent: ExtractedIntent): boolean {
  return (
    intent.purpose.length > 0 &&
    intent.features.length > 0
  );
}
