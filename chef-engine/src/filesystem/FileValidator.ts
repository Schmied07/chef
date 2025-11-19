import type { ProjectFile, ValidationResult } from '../types/index.js';
import { FileUtils } from './FileUtils.js';
import type { Logger } from '../utils/logger.js';

/**
 * File validator
 */
export class FileValidator {
  constructor(private logger?: Logger) {}

  /**
   * Validate project files
   */
  validate(files: ProjectFile[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if files array is empty
    if (files.length === 0) {
      errors.push('Project must contain at least one file');
      return { valid: false, errors, warnings };
    }

    // Validate paths
    const pathValidation = FileUtils.validatePaths(files);
    errors.push(...pathValidation.errors);
    warnings.push(...pathValidation.warnings);

    // Check for package.json
    const hasPackageJson = files.some(f => f.path === 'package.json');
    if (!hasPackageJson) {
      warnings.push('No package.json found - project may not build correctly');
    }

    // Check for duplicate paths
    const paths = new Set<string>();
    for (const file of files) {
      if (paths.has(file.path)) {
        errors.push(`Duplicate file path: ${file.path}`);
      }
      paths.add(file.path);
    }

    // Check total project size
    const totalSize = FileUtils.calculateTotalSize(files);
    const totalSizeMB = totalSize / 1024 / 1024;
    if (totalSizeMB > 100) {
      errors.push(`Project size too large: ${totalSizeMB.toFixed(2)}MB (max 100MB)`);
    } else if (totalSizeMB > 50) {
      warnings.push(`Large project size: ${totalSizeMB.toFixed(2)}MB`);
    }

    // Check file count
    if (files.length > 1000) {
      errors.push(`Too many files: ${files.length} (max 1000)`);
    } else if (files.length > 500) {
      warnings.push(`Large number of files: ${files.length}`);
    }

    // Log results
    if (errors.length > 0) {
      this.logger?.error({ errors }, 'File validation failed');
    }
    if (warnings.length > 0) {
      this.logger?.warn({ warnings }, 'File validation warnings');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate project structure
   */
  validateProjectStructure(files: ProjectFile[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for entry point
    const entryPoints = [
      'index.html',
      'index.js',
      'index.ts',
      'src/main.js',
      'src/main.ts',
      'src/index.js',
      'src/index.ts',
    ];
    const hasEntryPoint = files.some(f => entryPoints.includes(f.path));
    if (!hasEntryPoint) {
      warnings.push('No standard entry point found (index.html, index.js, etc.)');
    }

    // Check for common configuration files
    const hasViteConfig = files.some(f => /vite\.config\.(js|ts)/.test(f.path));
    const hasWebpackConfig = files.some(f => /webpack\.config\.js/.test(f.path));
    const hasBuildConfig = hasViteConfig || hasWebpackConfig;

    if (!hasBuildConfig) {
      warnings.push('No build configuration found (vite.config, webpack.config)');
    }

    // Check for TypeScript configuration if TS files present
    const hasTsFiles = files.some(f => FileUtils.getExtension(f.path) === '.ts' || FileUtils.getExtension(f.path) === '.tsx');
    const hasTsConfig = files.some(f => f.path === 'tsconfig.json');
    if (hasTsFiles && !hasTsConfig) {
      warnings.push('TypeScript files found but no tsconfig.json');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
}