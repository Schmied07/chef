import type { ProjectDependencies, ProjectFile } from '../types/index.js';
import type { Logger } from '../utils/logger.js';

/**
 * Manifest Builder
 * Constructs package.json manifest for builds
 */
export class ManifestBuilder {
  constructor(private logger?: Logger) {}

  /**
   * Build or update package.json manifest
   */
  buildManifest(
    files: ProjectFile[],
    additionalDeps?: ProjectDependencies
  ): string {
    const existingPackageFile = files.find(f => f.path === 'package.json');
    
    let manifest: any;

    if (existingPackageFile) {
      // Parse existing package.json
      try {
        manifest = JSON.parse(existingPackageFile.content);
        this.logger?.debug('Using existing package.json');
      } catch (error) {
        this.logger?.error({ error }, 'Failed to parse existing package.json, creating new one');
        manifest = this.createDefaultManifest();
      }
    } else {
      // Create new manifest
      manifest = this.createDefaultManifest();
      this.logger?.debug('Creating new package.json');
    }

    // Merge additional dependencies if provided
    if (additionalDeps) {
      manifest.dependencies = {
        ...manifest.dependencies,
        ...additionalDeps.dependencies,
      };
      manifest.devDependencies = {
        ...manifest.devDependencies,
        ...additionalDeps.devDependencies,
      };
      if (additionalDeps.peerDependencies) {
        manifest.peerDependencies = {
          ...manifest.peerDependencies,
          ...additionalDeps.peerDependencies,
        };
      }
    }

    // Ensure required scripts
    manifest.scripts = {
      dev: 'vite',
      build: 'vite build',
      preview: 'vite preview',
      ...manifest.scripts,
    };

    return JSON.stringify(manifest, null, 2);
  }

  /**
   * Create default package.json structure
   */
  private createDefaultManifest(): any {
    return {
      name: 'chef-project',
      version: '0.0.0',
      type: 'module',
      scripts: {
        dev: 'vite',
        build: 'vite build',
        preview: 'vite preview',
      },
      dependencies: {},
      devDependencies: {
        vite: '^5.0.0',
      },
    };
  }

  /**
   * Validate manifest structure
   */
  validateManifest(manifestStr: string): boolean {
    try {
      const manifest = JSON.parse(manifestStr);
      
      // Check required fields
      if (!manifest.name || typeof manifest.name !== 'string') {
        this.logger?.error('Manifest missing or invalid name field');
        return false;
      }

      if (!manifest.version || typeof manifest.version !== 'string') {
        this.logger?.error('Manifest missing or invalid version field');
        return false;
      }

      return true;
    } catch (error) {
      this.logger?.error({ error }, 'Failed to validate manifest');
      return false;
    }
  }
}