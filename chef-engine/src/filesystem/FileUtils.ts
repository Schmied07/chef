import path from 'path';
import type { ProjectFile, ValidationResult } from '../types/index.js';

/**
 * File utility functions
 */
export class FileUtils {
  /**
   * Normalize file paths across different operating systems
   */
  static normalizePaths(files: ProjectFile[]): ProjectFile[] {
    return files.map(file => ({
      ...file,
      path: path.posix.normalize(file.path.replace(/\\/g, '/')),
    }));
  }

  /**
   * Calculate total size of all files
   */
  static calculateTotalSize(files: ProjectFile[]): number {
    return files.reduce((total, file) => {
      return total + (file.size || Buffer.byteLength(file.content, 'utf8'));
    }, 0);
  }

  /**
   * Get file extension
   */
  static getExtension(filePath: string): string {
    return path.extname(filePath).toLowerCase();
  }

  /**
   * Check if file is a configuration file
   */
  static isConfigFile(filePath: string): boolean {
    const configFiles = [
      'package.json',
      'tsconfig.json',
      'vite.config.ts',
      'vite.config.js',
      'webpack.config.js',
      '.babelrc',
      '.eslintrc',
      'tailwind.config.js',
    ];
    const basename = path.basename(filePath);
    return configFiles.includes(basename);
  }

  /**
   * Check if file is a source code file
   */
  static isSourceFile(filePath: string): boolean {
    const sourceExtensions = ['.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte'];
    return sourceExtensions.includes(this.getExtension(filePath));
  }

  /**
   * Get directory structure depth
   */
  static getMaxDepth(files: ProjectFile[]): number {
    return Math.max(
      ...files.map(file => file.path.split('/').length),
      0
    );
  }

  /**
   * Validate file paths
   */
  static validatePaths(files: ProjectFile[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const file of files) {
      // Check for absolute paths
      if (path.isAbsolute(file.path)) {
        errors.push(`File path must be relative: ${file.path}`);
      }

      // Check for parent directory references
      if (file.path.includes('..')) {
        errors.push(`File path cannot contain '..': ${file.path}`);
      }

      // Check for empty content
      if (!file.content && !file.path.endsWith('/')) {
        warnings.push(`File has empty content: ${file.path}`);
      }

      // Check for large files
      const size = file.size || Buffer.byteLength(file.content, 'utf8');
      if (size > 10 * 1024 * 1024) { // 10MB
        warnings.push(`Large file detected (${(size / 1024 / 1024).toFixed(2)}MB): ${file.path}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Convert file array to object map
   */
  static filesToMap(files: ProjectFile[]): Record<string, string> {
    return files.reduce((map, file) => {
      map[file.path] = file.content;
      return map;
    }, {} as Record<string, string>);
  }

  /**
   * Find files by pattern
   */
  static findFilesByPattern(files: ProjectFile[], pattern: RegExp): ProjectFile[] {
    return files.filter(file => pattern.test(file.path));
  }
}