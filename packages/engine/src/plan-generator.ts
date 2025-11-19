/**
 * Plan Generator - Creates execution plans from extracted intents
 */

import type { ExtractedIntent, GenerationPlan, PlanStep } from './types';
import { callAIService } from './utils/ai-bridge';

/**
 * Generates a detailed execution plan from the extracted intent using AI
 */
export async function generatePlan(
  intent: ExtractedIntent
): Promise<GenerationPlan> {
  try {
    const result = await callAIService('generate_plan', {
      intent
    });
    
    return {
      steps: result.steps || [],
      dependencies: result.dependencies || [],
      estimatedTime: result.estimatedTime || 300,
    };
  } catch (error) {
    console.error('Error generating plan:', error);
    // Fallback to basic plan
    return {
      steps: [],
      dependencies: [],
      estimatedTime: 0,
    };
  }
}

/**
 * Validates a generation plan
 */
export function validatePlan(plan: GenerationPlan): boolean {
  return plan.steps.length > 0;
}

/**
 * Optimizes a plan by removing redundant steps
 */
export function optimizePlan(plan: GenerationPlan): GenerationPlan {
  // TODO: Implement plan optimization
  return plan;
}
