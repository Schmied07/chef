import type { ProjectDependencies, ProjectFile } from '../types/index.js';
import type { Logger } from '../utils/logger.js';

/**
 * Heavy dependencies that require Docker execution
 */
const HEAVY_DEPENDENCIES = new Set([
  'webpack',
  'prisma',
  '@prisma/client',
  'next',
  'nuxt',
  'electron',
  'puppeteer',
  'playwright',
  'sharp',
  'node-gyp',
  'bcrypt',
  'sqlite3',
  'pg',
  'mysql',
  'mysql2',
  'mongodb',
  'canvas',
  '@tensorflow/tfjs-node',
]);

/**
 * Dependency Resolver
 * Analyzes and resolves project dependencies
 */
export class DependencyResolver {
  constructor(private logger?: Logger) {}

  /**
   * Resolve dependencies from package.json content
   */
  resolveDependencies(files: ProjectFile[]): ProjectDependencies | null {
    const packageFile = files.find(f => f.path === 'package.json');
    if (!packageFile) {
      this.logger?.warn('No package.json found in project');
      return null;
    }

    try {
      const packageJson = JSON.parse(packageFile.content);
      return {
        dependencies: packageJson.dependencies || {},
        devDependencies: packageJson.devDependencies || {},
        peerDependencies: packageJson.peerDependencies || {},
      };
    } catch (error) {
      this.logger?.error({ error }, 'Failed to parse package.json');
      return null;
    }
  }

  /**
   * Count total dependencies
   */
  countDependencies(deps: ProjectDependencies): number {
    const depCount = Object.keys(deps.dependencies || {}).length;
    const devDepCount = Object.keys(deps.devDependencies || {}).length;
    const peerDepCount = Object.keys(deps.peerDependencies || {}).length;
    return depCount + devDepCount + peerDepCount;
  }

  /**
   * Check if project has heavy dependencies
   */
  isDependencyHeavy(deps: ProjectDependencies): boolean {
    const allDeps = [
      ...Object.keys(deps.dependencies || {}),
      ...Object.keys(deps.devDependencies || {}),
    ];

    const hasHeavyDep = allDeps.some(dep => HEAVY_DEPENDENCIES.has(dep));

    if (hasHeavyDep) {
      const heavyDeps = allDeps.filter(dep => HEAVY_DEPENDENCIES.has(dep));
      this.logger?.info({ heavyDeps }, 'Heavy dependencies detected');
    }

    return hasHeavyDep;
  }

  /**
   * Check if project has native dependencies
   */
  hasNativeDependencies(deps: ProjectDependencies): boolean {
    const allDeps = [
      ...Object.keys(deps.dependencies || {}),
      ...Object.keys(deps.devDependencies || {}),
    ];

    // Common indicators of native dependencies
    const nativeIndicators = ['node-gyp', 'native', 'binding', 'addon'];
    return allDeps.some(dep => 
      nativeIndicators.some(indicator => dep.toLowerCase().includes(indicator))
    );
  }

  /**
   * Detect if project has a build step
   */
  hasBuildStep(files: ProjectFile[], deps?: ProjectDependencies): boolean {
    // Check for build configuration files
    const buildConfigFiles = [
      'vite.config.js',
      'vite.config.ts',
      'webpack.config.js',
      'rollup.config.js',
      'tsconfig.json',
    ];

    const hasBuildConfig = files.some(f => 
      buildConfigFiles.some(config => f.path.includes(config))
    );

    if (hasBuildConfig) return true;

    // Check for build script in package.json
    if (deps) {
      const packageFile = files.find(f => f.path === 'package.json');
      if (packageFile) {
        try {
          const pkg = JSON.parse(packageFile.content);
          return !!(pkg.scripts?.build);
        } catch {
          return false;
        }
      }
    }

    return false;
  }

  /**
   * Analyze dependency complexity
   */
  analyzeDependencyComplexity(deps: ProjectDependencies): {
    count: number;
    isHeavy: boolean;
    hasNative: boolean;
    score: number;
  } {
    const count = this.countDependencies(deps);
    const isHeavy = this.isDependencyHeavy(deps);
    const hasNative = this.hasNativeDependencies(deps);

    // Calculate complexity score (0-100)
    let score = 0;
    
    // Base score from dependency count
    score += Math.min(count, 50); // Max 50 points for dependency count

    // Heavy dependencies add significant complexity
    if (isHeavy) score += 30;

    // Native dependencies add complexity
    if (hasNative) score += 20;

    // Cap at 100
    score = Math.min(score, 100);

    this.logger?.debug({ count, isHeavy, hasNative, score }, 'Dependency complexity analyzed');

    return { count, isHeavy, hasNative, score };
  }
}