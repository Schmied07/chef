/**
 * Pipeline - Orchestrates the entire code generation process
 * 
 * Flow: prompt → extraction → plan → génération → analyse → tests → build
 */

import type {
  UserPrompt,
  ExtractedIntent,
  GenerationPlan,
  GeneratedCode,
  AnalysisResult,
  GeneratedTests,
  ExecutionResult,
  PipelineConfig,
} from './types';

import { extractIntent } from './intent-extractor';
import { generatePlan } from './plan-generator';
import { buildPrompt } from './prompt-manager';
import { generateCode } from './code-generator';
import { analyzeCode } from './static-analyzer';
import { generateTests } from './test-generator';
import { executeCode, runTests } from './executor';

export interface PipelineResult {
  intent: ExtractedIntent;
  plan: GenerationPlan;
  code: GeneratedCode;
  analysis?: AnalysisResult;
  tests?: GeneratedTests;
  execution?: ExecutionResult;
  success: boolean;
  error?: string;
}

/**
 * Runs the complete code generation pipeline
 */
export async function runPipeline(
  prompt: UserPrompt,
  config: PipelineConfig = {
    enableAnalysis: true,
    enableTests: true,
    enableExecution: false,
  }
): Promise<PipelineResult> {
  try {
    // Step 1: Extract intent from prompt
    console.log('🔍 Extracting intent...');
    const intent = await extractIntent(prompt);

    // Step 2: Generate execution plan
    console.log('📋 Generating plan...');
    const plan = await generatePlan(intent);

    // Step 3: Build optimized prompt
    console.log('✏️ Building prompt...');
    const optimizedPrompt = buildPrompt(intent, plan);

    // Step 4: Generate code
    console.log('🔨 Generating code...');
    const code = await generateCode(plan, optimizedPrompt);

    // Step 5: Analyze code (optional)
    let analysis: AnalysisResult | undefined;
    if (config.enableAnalysis) {
      console.log('🔬 Analyzing code...');
      analysis = await analyzeCode(code);
    }

    // Step 6: Generate tests (optional)
    let tests: GeneratedTests | undefined;
    if (config.enableTests) {
      console.log('🧪 Generating tests...');
      tests = await generateTests(code);
    }

    // Step 7: Execute and validate (optional)
    let execution: ExecutionResult | undefined;
    if (config.enableExecution) {
      console.log('🚀 Executing code...');
      execution = await executeCode(code);
      
      if (tests) {
        console.log('✅ Running tests...');
        const testResult = await runTests(code);
        execution = {
          ...execution,
          success: execution.success && testResult.success,
        };
      }
    }

    console.log('✨ Pipeline complete!');
    
    return {
      intent,
      plan,
      code,
      analysis,
      tests,
      execution,
      success: true,
    };
  } catch (error) {
    console.error('❌ Pipeline failed:', error);
    return {
      intent: { purpose: '', features: [] },
      plan: { steps: [], dependencies: [] },
      code: {
        files: [],
        dependencies: {},
        metadata: {
          framework: '',
          template: '',
          features: [],
          createdAt: new Date(),
        },
      },
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Runs only the generation phase without analysis or execution
 */
export async function quickGenerate(prompt: UserPrompt): Promise<GeneratedCode> {
  const result = await runPipeline(prompt, {
    enableAnalysis: false,
    enableTests: false,
    enableExecution: false,
  });
  
  if (!result.success) {
    throw new Error(result.error || 'Generation failed');
  }
  
  return result.code;
}
