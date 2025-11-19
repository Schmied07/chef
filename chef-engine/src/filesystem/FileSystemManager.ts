import type { ProjectFile, ValidationResult } from '../types/index.js';
import { FileValidator } from './FileValidator.js';
import { FileUtils } from './FileUtils.js';
import type { Logger } from '../utils/logger.js';

/**
 * FileSystem Manager
 * Handles file organization and preparation for build execution
 */
export class FileSystemManager {
  private validator: FileValidator;

  constructor(private logger?: Logger) {
    this.validator = new FileValidator(logger);
  }

  /**
   * Prepare files for execution
   * Normalizes paths, validates structure, and organizes files
   */
  async prepareFiles(files: ProjectFile[]): Promise<{
    files: ProjectFile[];
    validation: ValidationResult;
    metadata: {
      fileCount: number;
      totalSize: number;
      maxDepth: number;
      hasPackageJson: boolean;
    };
  }> {
    this.logger?.info({ fileCount: files.length }, 'Preparing files for execution');

    // Normalize paths
    const normalizedFiles = FileUtils.normalizePaths(files);

    // Validate files
    const validation = this.validator.validate(normalizedFiles);

    // Validate project structure
    const structureValidation = this.validator.validateProjectStructure(normalizedFiles);
    validation.warnings.push(...structureValidation.warnings);

    // Calculate metadata
    const metadata = {
      fileCount: normalizedFiles.length,
      totalSize: FileUtils.calculateTotalSize(normalizedFiles),
      maxDepth: FileUtils.getMaxDepth(normalizedFiles),
      hasPackageJson: normalizedFiles.some(f => f.path === 'package.json'),
    };

    this.logger?.debug({ metadata }, 'Files prepared');

    return {
      files: normalizedFiles,
      validation,
      metadata,
    };
  }

  /**
   * Organize files into a map structure
   */
  organizeFiles(files: ProjectFile[]): Record<string, string> {
    return FileUtils.filesToMap(files);
  }

  /**
   * Extract configuration files
   */
  extractConfigFiles(files: ProjectFile[]): ProjectFile[] {
    return files.filter(file => FileUtils.isConfigFile(file.path));
  }

  /**
   * Extract source files
   */
  extractSourceFiles(files: ProjectFile[]): ProjectFile[] {
    return files.filter(file => FileUtils.isSourceFile(file.path));
  }

  /**
   * Get package.json content if exists
   */
  getPackageJson(files: ProjectFile[]): any | null {
    const packageFile = files.find(f => f.path === 'package.json');
    if (!packageFile) return null;

    try {
      return JSON.parse(packageFile.content);
    } catch (error) {
      this.logger?.error({ error }, 'Failed to parse package.json');
      return null;
    }
  }
}