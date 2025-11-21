/**
 * Template renderer - Renders templates with variables
 */

import type { TemplateMetadata, RenderContext, RenderedFile } from './types';

/**
 * Simple template renderer using ${variable} syntax
 */
export function renderTemplate(template: string, context: RenderContext): string {
  return template.replace(/\$\{([^}]+)\}/g, (match, variable) => {
    const value = context[variable.trim()];
    return value !== undefined ? String(value) : match;
  });
}

/**
 * Evaluates a condition expression
 */
export function evaluateCondition(condition: string, context: RenderContext): boolean {
  try {
    // Simple expression evaluation for now
    // TODO: Implement safer expression evaluation
    const func = new Function(...Object.keys(context), `return ${condition}`);
    return func(...Object.values(context));
  } catch {
    return false;
  }
}

/**
 * Renders all files from a template
 */
export function renderTemplateFiles(
  metadata: TemplateMetadata,
  context: RenderContext
): RenderedFile[] {
  const renderedFiles: RenderedFile[] = [];

  for (const file of metadata.files) {
    // Check if file should be generated based on condition
    if (file.condition && !evaluateCondition(file.condition, context)) {
      continue;
    }

    // Render file path and content
    const path = renderTemplate(file.path, context);
    const content = renderTemplate(file.template, context);

    renderedFiles.push({ path, content });
  }

  return renderedFiles;
}
