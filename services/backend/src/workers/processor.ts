/**
 * Project processor - Executes the generation pipeline
 */

import { runPipeline } from '@chef/engine';
import { updateProject, addLog } from '../db/projects';
import { logger } from '../utils/logger';

export async function processProject(project: any) {
  try {
    // Update status to processing
    await updateProject(project.id, { status: 'processing', progress: 0 });
    await addLog(project.id, 'Starting code generation...');

    // Run the generation pipeline
    const result = await runPipeline(
      {
        text: project.prompt,
        timestamp: new Date(project.createdAt),
      },
      project.config
    );

    if (result.success) {
      await updateProject(project.id, {
        status: 'completed',
        progress: 100,
        result: result.code,
      });
      await addLog(project.id, 'Code generation completed successfully');
    } else {
      await updateProject(project.id, {
        status: 'failed',
        error: result.error,
      });
      await addLog(project.id, `Generation failed: ${result.error}`);
    }

    return result;
  } catch (error) {
    logger.error(`Error in processor for project ${project.id}:`, error);
    await updateProject(project.id, {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}
