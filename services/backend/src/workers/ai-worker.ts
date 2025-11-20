/**
 * AI Worker - Integrates @chef/engine with the build pipeline
 */

import { runPipeline } from '@chef/engine';
import type { BuildJob, BuildResult, FileItem } from '../types/job';
import { logger } from '../utils/logger';

/**
 * Process a build job using the AI engine
 */
export async function processAIJob(
  prompt: string,
  config?: {
    enableAnalysis?: boolean;
    enableTests?: boolean;
    enableExecution?: boolean;
  }
): Promise<{
  success: boolean;
  files: FileItem[];
  dependencies: Record<string, string>;
  error?: string;
}> {
  try {
    logger.info('Starting AI pipeline for prompt:', prompt.substring(0, 100));

    // Run the AI generation pipeline
    const result = await runPipeline(
      {
        text: prompt,
        timestamp: new Date(),
      },
      {
        enableAnalysis: config?.enableAnalysis ?? true,
        enableTests: config?.enableTests ?? true,
        enableExecution: config?.enableExecution ?? false,
      }
    );

    if (!result.success) {
      logger.error('AI pipeline failed:', result.error);
      return {
        success: false,
        files: [],
        dependencies: {},
        error: result.error,
      };
    }

    // Convert generated files to BuildJob format
    const files: FileItem[] = result.code.files.map((file) => ({
      path: file.path,
      content: file.content,
      language: file.language,
    }));

    logger.info(`AI pipeline completed. Generated ${files.length} files`);

    return {
      success: true,
      files,
      dependencies: result.code.dependencies || {},
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error in AI worker:', error);
    return {
      success: false,
      files: [],
      dependencies: {},
      error: errorMessage,
    };
  }
}

/**
 * Create a BuildJob from AI generation results
 */
export function createBuildJobFromAI(
  jobId: string,
  projectId: string,
  aiResult: Awaited<ReturnType<typeof processAIJob>>,
  strategy?: BuildJob['strategy']
): BuildJob | null {
  if (!aiResult.success) {
    return null;
  }

  return {
    jobId,
    projectId,
    files: aiResult.files,
    dependencies: aiResult.dependencies,
    executionMode: 'docker',
    strategy: strategy || {
      runtime: 'node',
      version: '18',
      installCommand: 'npm install',
      buildCommand: 'npm run build',
      startCommand: 'npm start',
    },
    metadata: {
      timestamp: new Date().toISOString(),
      timeout: 300000, // 5 minutes
    },
  };
}
