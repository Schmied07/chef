import type { Logger } from '../utils/logger.js';

/**
 * Version Resolver
 * Resolves and validates dependency versions
 */
export class VersionResolver {
  constructor(private logger?: Logger) {}

  /**
   * Parse version string
   */
  parseVersion(version: string): { major: number; minor: number; patch: number } | null {
    // Remove prefixes like ^, ~, >=, etc.
    const cleanVersion = version.replace(/[^0-9.]/g, '');
    const parts = cleanVersion.split('.');

    if (parts.length < 3) {
      this.logger?.warn({ version }, 'Invalid version format');
      return null;
    }

    return {
      major: parseInt(parts[0], 10) || 0,
      minor: parseInt(parts[1], 10) || 0,
      patch: parseInt(parts[2], 10) || 0,
    };
  }

  /**
   * Check if version is compatible with range
   */
  isCompatible(version: string, range: string): boolean {
    // Simple compatibility check
    // In production, use a library like semver
    const versionParsed = this.parseVersion(version);
    const rangeParsed = this.parseVersion(range);

    if (!versionParsed || !rangeParsed) return false;

    // Caret (^) - compatible with same major version
    if (range.startsWith('^')) {
      return versionParsed.major === rangeParsed.major;
    }

    // Tilde (~) - compatible with same minor version
    if (range.startsWith('~')) {
      return (
        versionParsed.major === rangeParsed.major &&
        versionParsed.minor === rangeParsed.minor
      );
    }

    // Exact match
    return version === range;
  }

  /**
   * Resolve version conflicts
   */
  resolveConflicts(
    dependencies: Record<string, string>,
    devDependencies: Record<string, string>
  ): string[] {
    const conflicts: string[] = [];

    // Check for same package in both dependencies and devDependencies
    for (const [pkg, version] of Object.entries(dependencies)) {
      if (devDependencies[pkg]) {
        const devVersion = devDependencies[pkg];
        if (!this.isCompatible(version, devVersion)) {
          conflicts.push(
            `${pkg}: version conflict between dependencies (${version}) and devDependencies (${devVersion})`
          );
        }
      }
    }

    if (conflicts.length > 0) {
      this.logger?.warn({ conflicts }, 'Version conflicts detected');
    }

    return conflicts;
  }

  /**
   * Normalize version string
   */
  normalizeVersion(version: string): string {
    // Ensure version has a prefix
    if (/^[0-9]/.test(version)) {
      return `^${version}`;
    }
    return version;
  }
}