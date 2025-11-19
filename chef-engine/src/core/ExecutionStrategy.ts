import type {
  ExecutionStrategy as Strategy,
  ComplexityScore,
  ComplexityAnalysis,
  ProjectFile,
  ProjectDependencies,
} from '../types/index.js';
import { ExecutionStrategy } from '../types/index.js';
import { DependencyResolver } from '../dependencies/DependencyResolver.js';
import { FileUtils } from '../filesystem/FileUtils.js';
import type { Logger } from '../utils/logger.js';

/**
 * Execution Strategy Selector
 * Decides whether to use WebContainer or Docker based on project complexity
 */
export class ExecutionStrategySelector {
  private dependencyResolver: DependencyResolver;

  constructor(private logger?: Logger) {
    this.dependencyResolver = new DependencyResolver(logger);
  }

  /**
   * Analyze project complexity and recommend execution strategy
   */
  analyzeComplexity(
    files: ProjectFile[],
    dependencies?: ProjectDependencies
  ): ComplexityAnalysis {
    this.logger?.info('Analyzing project complexity');

    let score: ComplexityScore = 0;
    const factors = {
      fileCount: files.length,
      totalSize: FileUtils.calculateTotalSize(files),
      dependencyCount: 0,
      hasHeavyDependencies: false,
      hasNativeDependencies: false,
      hasBuildStep: false,
    };

    // Factor 1: File count (0-20 points)
    if (factors.fileCount <= 10) {
      score += 5;
    } else if (factors.fileCount <= 50) {
      score += 10;
    } else if (factors.fileCount <= 200) {
      score += 15;
    } else {
      score += 20;
    }

    // Factor 2: Total size (0-20 points)
    const sizeMB = factors.totalSize / 1024 / 1024;
    if (sizeMB <= 1) {
      score += 5;
    } else if (sizeMB <= 5) {
      score += 10;
    } else if (sizeMB <= 20) {
      score += 15;
    } else {
      score += 20;
    }

    // Factor 3: Dependencies (0-30 points)
    if (dependencies) {
      const depAnalysis = this.dependencyResolver.analyzeDependencyComplexity(dependencies);
      factors.dependencyCount = depAnalysis.count;
      factors.hasHeavyDependencies = depAnalysis.isHeavy;
      factors.hasNativeDependencies = depAnalysis.hasNative;

      score += Math.min(depAnalysis.score * 0.3, 30); // Scale dependency score to 0-30
    }

    // Factor 4: Build configuration (0-15 points)
    factors.hasBuildStep = this.dependencyResolver.hasBuildStep(files, dependencies);
    if (factors.hasBuildStep) {
      score += 15;
    }

    // Factor 5: Heavy/Native dependencies (0-15 points)
    if (factors.hasHeavyDependencies) {
      score += 10;
    }
    if (factors.hasNativeDependencies) {
      score += 5;
    }

    // Cap score at 100
    score = Math.min(Math.round(score), 100);

    // Determine recommended strategy
    const recommendedStrategy = this.selectStrategy(score, factors);

    // Generate reasoning
    const reasoning = this.generateReasoning(score, factors, recommendedStrategy);

    const analysis: ComplexityAnalysis = {
      score,
      recommendedStrategy,
      factors,
      reasoning,
    };

    this.logger?.info(
      { score, strategy: recommendedStrategy, factors },
      'Complexity analysis complete'
    );

    return analysis;
  }

  /**
   * Select execution strategy based on complexity score
   */
  private selectStrategy(
    score: ComplexityScore,
    factors: ComplexityAnalysis['factors']
  ): Strategy {
    // Heavy or native dependencies always require Docker
    if (factors.hasHeavyDependencies || factors.hasNativeDependencies) {
      return ExecutionStrategy.DOCKER;
    }

    // Score-based decision
    if (score <= 30) {
      return ExecutionStrategy.WEBCONTAINER;
    } else if (score <= 70) {
      // Medium complexity - prefer WebContainer but could use Docker
      return factors.hasBuildStep 
        ? ExecutionStrategy.DOCKER 
        : ExecutionStrategy.WEBCONTAINER;
    } else {
      return ExecutionStrategy.DOCKER;
    }
  }

  /**
   * Generate human-readable reasoning
   */
  private generateReasoning(
    score: ComplexityScore,
    factors: ComplexityAnalysis['factors'],
    strategy: Strategy
  ): string {
    const reasons: string[] = [];

    // File complexity
    if (factors.fileCount > 200) {
      reasons.push(`Large project with ${factors.fileCount} files`);
    } else if (factors.fileCount > 50) {
      reasons.push(`Medium-sized project with ${factors.fileCount} files`);
    } else {
      reasons.push(`Small project with ${factors.fileCount} files`);
    }

    // Size complexity
    const sizeMB = (factors.totalSize / 1024 / 1024).toFixed(2);
    if (factors.totalSize > 20 * 1024 * 1024) {
      reasons.push(`Large codebase (${sizeMB}MB)`);
    }

    // Dependencies
    if (factors.hasHeavyDependencies) {
      reasons.push('Contains heavy dependencies requiring Docker isolation');
    }
    if (factors.hasNativeDependencies) {
      reasons.push('Contains native dependencies requiring system binaries');
    }
    if (factors.dependencyCount > 50) {
      reasons.push(`Many dependencies (${factors.dependencyCount})`);
    }

    // Build step
    if (factors.hasBuildStep) {
      reasons.push('Requires build step with bundler');
    }

    // Strategy reasoning
    if (strategy === ExecutionStrategy.WEBCONTAINER) {
      reasons.push('WebContainer suitable for fast, lightweight execution');
    } else {
      reasons.push('Docker recommended for robust, isolated execution');
    }

    return reasons.join('. ') + `.`;
  }

  /**
   * Decide execution strategy with optional override
   */
  decideStrategy(
    files: ProjectFile[],
    dependencies?: ProjectDependencies,
    override?: Strategy
  ): {
    strategy: Strategy;
    analysis: ComplexityAnalysis;
  } {
    const analysis = this.analyzeComplexity(files, dependencies);

    // Use override if AUTO is not specified
    if (override && override !== ExecutionStrategy.AUTO) {
      this.logger?.info(
        { override, recommended: analysis.recommendedStrategy },
        'Using overridden strategy'
      );
      return {
        strategy: override,
        analysis,
      };
    }

    return {
      strategy: analysis.recommendedStrategy,
      analysis,
    };
  }

  /**
   * Estimate build complexity (simplified version for quick checks)
   */
  estimateBuildComplexity(files: ProjectFile[], dependencies?: ProjectDependencies): number {
    const analysis = this.analyzeComplexity(files, dependencies);
    return analysis.score;
  }
}