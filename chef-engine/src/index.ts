/**
 * @chef/engine
 * Core build orchestration engine for Chef
 * 
 * This module provides the main interface for creating and managing builds.
 * It orchestrates the entire build lifecycle:
 * 1. Validates and prepares project files
 * 2. Analyzes complexity and selects execution strategy (WebContainer vs Docker)
 * 3. Creates jobs via the workers service
 * 4. Monitors progress and returns results
 * 
 * Flow:
 * Convex Backend → @chef/engine → Workers API → Docker Workers → Webhook → Convex
 */

export { BuildEngine } from './core/BuildEngine.js';
export { ExecutionStrategySelector } from './core/ExecutionStrategy.js';
export { JobCreator } from './core/JobCreator.js';

export { FileSystemManager } from './filesystem/FileSystemManager.js';
export { FileValidator } from './filesystem/FileValidator.js';
export { FileUtils } from './filesystem/FileUtils.js';

export { DependencyResolver } from './dependencies/DependencyResolver.js';
export { ManifestBuilder } from './dependencies/ManifestBuilder.js';
export { VersionResolver } from './dependencies/VersionResolver.js';

export { WorkersClient } from './workers/WorkersClient.js';

export { createLogger } from './utils/logger.js';
export { retryWithBackoff } from './utils/retry.js';

export * from './types/index.js';

// Re-export main class for convenience
export { BuildEngine as default } from './core/BuildEngine.js';