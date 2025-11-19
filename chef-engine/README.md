# @chef/engine

Core build orchestration engine for Chef - Decides execution strategy and manages the complete build lifecycle.

## Overview

`@chef/engine` is the central orchestrator that sits between the Convex backend and the workers service. It analyzes project complexity, decides the optimal execution strategy (WebContainer vs Docker), prepares the filesystem, and manages jobs throughout their lifecycle.

## Architecture

```
┌─────────────────┐
│ Convex Backend  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  @chef/engine   │  ◄── This Module
│                 │
│ • BuildEngine   │  Main orchestrator
│ • Strategy      │  WebContainer vs Docker
│ • FileSystem    │  File preparation
│ • Dependencies  │  Dependency resolution
│ • Workers API   │  Job management
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Workers API    │  (HTTP)
│   /api/jobs     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  BullMQ Queue   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Docker Workers  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Webhook Back to │
│ Convex Backend  │
└─────────────────┘
```

## Features

### Core Capabilities

- **Intelligent Strategy Selection**: Automatically decides WebContainer vs Docker based on complexity analysis (0-100 score)
- **File System Management**: Validates, normalizes, and organizes project files
- **Dependency Resolution**: Analyzes dependencies and detects heavy/native packages
- **Build Orchestration**: Creates, monitors, and manages build jobs
- **Retry Logic**: Exponential backoff with configurable retries
- **Comprehensive Logging**: Structured logging with pino

### Complexity Analysis (0-100)

The engine analyzes project complexity across multiple dimensions:

- **0-30 (Simple)**: Small projects, few files, lightweight dependencies → **WebContainer**
- **31-70 (Medium)**: Medium projects, moderate complexity → **WebContainer or Docker**
- **71-100 (Heavy)**: Large projects, heavy dependencies, native modules → **Docker**

### Factors Considered

1. **File Count**: Number of project files
2. **Total Size**: Combined size of all files
3. **Dependencies**: Number and type of npm packages
4. **Heavy Dependencies**: webpack, prisma, next, electron, etc.
5. **Native Dependencies**: Packages requiring native binaries
6. **Build Configuration**: Presence of build tools (Vite, webpack, etc.)

## Installation

```bash
# From the workspace root
cd /app/chef-engine
pnpm install
```

## Quick Start

### Basic Usage

```typescript
import { BuildEngine } from '@chef/engine';

// Initialize the engine
const engine = new BuildEngine({
  workersApiUrl: 'http://localhost:3001',
  logger: {
    level: 'info',
    pretty: true,
  },
});

// Create a build
const result = await engine.createBuild({
  chatId: 'chat-123',
  files: [
    { path: 'index.html', content: '<html>...</html>' },
    { path: 'src/main.ts', content: 'console.log("Hello")' },
  ],
  dependencies: {
    dependencies: {
      'react': '^18.0.0',
      'react-dom': '^18.0.0',
    },
  },
});

console.log(`Build created: ${result.buildId}`);
console.log(`Strategy: ${result.strategy}`);
console.log(`Complexity: ${result.complexity.score}`);

// Wait for build completion
const buildResult = await engine.waitForBuild(result.buildId, {
  timeout: 300000,
  onProgress: (progress) => {
    console.log(`Build progress: ${progress}%`);
  },
});

console.log(`Build status: ${buildResult.status}`);
```

### Estimate Complexity Without Building

```typescript
const complexity = engine.estimateBuildComplexity(files, dependencies);

console.log(`Complexity Score: ${complexity.score}`);
console.log(`Recommended Strategy: ${complexity.recommendedStrategy}`);
console.log(`Reasoning: ${complexity.reasoning}`);
```

### Check Workers Service Health

```typescript
const isHealthy = await engine.checkHealth();
if (!isHealthy) {
  console.error('Workers service is not available');
}
```

## API Reference

### BuildEngine

Main orchestrator class for managing builds.

#### Constructor

```typescript
new BuildEngine(config: EngineConfig)
```

**Configuration:**

```typescript
interface EngineConfig {
  workersApiUrl: string;              // Workers service URL (required)
  workersApiTimeout?: number;         // API timeout in ms (default: 30000)
  maxRetries?: number;                // Max retry attempts (default: 3)
  retryDelay?: number;                // Initial retry delay in ms (default: 1000)
  logger?: {
    level?: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
    pretty?: boolean;                 // Pretty print logs (default: true in dev)
  };
}
```

#### Methods

**createBuild(request: BuildRequest)**

Creates a new build job.

```typescript
interface BuildRequest {
  chatId: string;                     // Unique chat identifier
  files: ProjectFile[];               // Project files
  dependencies?: ProjectDependencies; // npm dependencies
  strategy?: ExecutionStrategy;       // Override strategy (optional)
  priority?: number;                  // Job priority 1-10 (default: 5)
}

// Returns
{
  buildId: string;
  status: 'pending';
  strategy: 'webcontainer' | 'docker';
  complexity: ComplexityAnalysis;
}
```

**getBuildStatus(buildId: string)**

Gets current build status.

```typescript
// Returns
{
  buildId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  strategy: ExecutionStrategy;
  progress: number;                   // 0-100
  createdAt: Date;
  finishedAt?: Date;
  logs?: string[];
  artifacts?: Record<string, string>;
  error?: string;
}
```

**waitForBuild(buildId: string, options?)**

Waits for build completion with polling.

```typescript
await engine.waitForBuild(buildId, {
  timeout: 300000,                    // Max wait time (default: 5 min)
  onProgress: (progress: number) => {
    // Called on each poll with progress update
  },
});
```

**cancelBuild(buildId: string)**

Cancels a running build.

```typescript
await engine.cancelBuild(buildId);
```

**estimateBuildComplexity(files, dependencies?)**

Analyzes complexity without creating a build.

```typescript
const analysis: ComplexityAnalysis = engine.estimateBuildComplexity(files, deps);

// ComplexityAnalysis structure
{
  score: number;                      // 0-100
  recommendedStrategy: ExecutionStrategy;
  factors: {
    fileCount: number;
    totalSize: number;
    dependencyCount: number;
    hasHeavyDependencies: boolean;
    hasNativeDependencies: boolean;
    hasBuildStep: boolean;
  };
  reasoning: string;                  // Human-readable explanation
}
```

**checkHealth()**

Checks if workers service is healthy.

```typescript
const isHealthy: boolean = await engine.checkHealth();
```

**getStats()**

Gets queue statistics from workers service.

```typescript
const stats = await engine.getStats();
```

### Types

```typescript
enum ExecutionStrategy {
  WEBCONTAINER = 'webcontainer',
  DOCKER = 'docker',
  AUTO = 'auto'
}

interface ProjectFile {
  path: string;                       // Relative path
  content: string;                    // File content
  size?: number;                      // Optional size in bytes
}

interface ProjectDependencies {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}
```

## Modules

### Core

- **BuildEngine**: Main orchestrator
- **ExecutionStrategy**: Strategy selector based on complexity
- **JobCreator**: Job management with workers API

### FileSystem

- **FileSystemManager**: File preparation and organization
- **FileValidator**: Validation of files and project structure
- **FileUtils**: Utility functions for file operations

### Dependencies

- **DependencyResolver**: Dependency analysis
- **ManifestBuilder**: package.json construction
- **VersionResolver**: Version compatibility checking

### Workers

- **WorkersClient**: HTTP client for workers service

## Development

### Project Structure

```
chef-engine/
├── src/
│   ├── core/
│   │   ├── BuildEngine.ts          # Main orchestrator
│   │   ├── ExecutionStrategy.ts    # Strategy selector
│   │   └── JobCreator.ts           # Job management
│   ├── filesystem/
│   │   ├── FileSystemManager.ts    # File preparation
│   │   ├── FileValidator.ts        # Validation
│   │   └── FileUtils.ts            # Utilities
│   ├── dependencies/
│   │   ├── DependencyResolver.ts   # Dependency analysis
│   │   ├── ManifestBuilder.ts      # Manifest builder
│   │   └── VersionResolver.ts      # Version resolution
│   ├── workers/
│   │   └── WorkersClient.ts        # Workers API client
│   ├── utils/
│   │   ├── logger.ts               # Logging
│   │   └── retry.ts                # Retry logic
│   ├── types/
│   │   └── index.ts                # TypeScript types
│   ├── __tests__/                  # Unit tests
│   └── index.ts                    # Public exports
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

### Scripts

```bash
# Development with watch mode
pnpm run dev

# Build TypeScript
pnpm run build

# Run tests
pnpm test

# Watch tests
pnpm test:watch

# Type checking
pnpm run typecheck
```

### Testing

```bash
# Run all tests
pnpm test

# Watch mode for development
pnpm test:watch

# Run specific test file
pnpm test FileUtils.test.ts
```

## Integration Examples

### Using in Convex Functions

```typescript
import { BuildEngine } from '@chef/engine';

// In a Convex mutation
export const createBuild = mutation({
  args: {
    chatId: v.string(),
    files: v.array(v.object({ path: v.string(), content: v.string() })),
  },
  handler: async (ctx, { chatId, files }) => {
    const engine = new BuildEngine({
      workersApiUrl: process.env.WORKERS_API_URL!,
    });

    const result = await engine.createBuild({
      chatId,
      files,
    });

    // Store build ID in database
    await ctx.db.insert('builds', {
      chatId,
      buildId: result.buildId,
      strategy: result.strategy,
      complexity: result.complexity.score,
      status: result.status,
    });

    return result;
  },
});
```

### Streaming Progress Updates

```typescript
export const buildWithProgress = mutation({
  args: { chatId: v.string(), files: v.any() },
  handler: async (ctx, { chatId, files }) => {
    const engine = new BuildEngine({
      workersApiUrl: process.env.WORKERS_API_URL!,
    });

    const { buildId } = await engine.createBuild({ chatId, files });

    // Poll for updates and stream to client
    const result = await engine.waitForBuild(buildId, {
      onProgress: async (progress) => {
        // Update database with progress
        await ctx.db.patch(buildId, { progress });
      },
    });

    return result;
  },
});
```

## Heavy Dependencies List

The following dependencies automatically trigger Docker execution:

- webpack
- prisma, @prisma/client
- next
- nuxt
- electron
- puppeteer
- playwright
- sharp
- node-gyp
- bcrypt
- sqlite3
- pg, mysql, mysql2
- mongodb
- canvas
- @tensorflow/tfjs-node

## Error Handling

The engine includes comprehensive error handling:

```typescript
try {
  const result = await engine.createBuild(request);
} catch (error) {
  if (error.message.includes('Workers API error')) {
    // Workers service unavailable
    console.error('Workers service error:', error);
  } else if (error.message.includes('Invalid build request')) {
    // Validation error
    console.error('Invalid request:', error);
  } else {
    // Other errors
    console.error('Build error:', error);
  }
}
```

## Retry Logic

Automatic retry with exponential backoff:

- **Default retries**: 3 attempts
- **Initial delay**: 1000ms
- **Max delay**: 30000ms
- **Backoff multiplier**: 2x per retry

## Logging

Structured logging with configurable levels:

```typescript
const engine = new BuildEngine({
  workersApiUrl: 'http://localhost:3001',
  logger: {
    level: 'debug',      // trace, debug, info, warn, error, fatal
    pretty: true,        // Pretty print for development
  },
});
```

## Best Practices

1. **Always check health** before creating builds
2. **Use complexity estimation** for UI indicators
3. **Implement progress callbacks** for better UX
4. **Handle timeouts gracefully** with appropriate limits
5. **Log errors** with context for debugging
6. **Monitor queue statistics** to detect bottlenecks

## Troubleshooting

### Workers Service Unreachable

```typescript
const isHealthy = await engine.checkHealth();
if (!isHealthy) {
  // Check if workers service is running
  // Verify workersApiUrl configuration
}
```

### Build Timeouts

Increase timeout for large projects:

```typescript
await engine.waitForBuild(buildId, {
  timeout: 600000,  // 10 minutes
});
```

### High Complexity Scores

Review factors to understand why:

```typescript
const analysis = engine.estimateBuildComplexity(files, deps);
console.log(analysis.factors);
console.log(analysis.reasoning);
```

## Performance

- **File validation**: O(n) where n = number of files
- **Complexity analysis**: O(n + d) where d = number of dependencies
- **Job creation**: Single HTTP request
- **Status polling**: Configurable interval (default: 2s)

## Roadmap

- [ ] Support for additional execution strategies
- [ ] Advanced caching mechanisms
- [ ] Build artifact storage
- [ ] Incremental builds
- [ ] Distributed builds
- [ ] Real-time progress streaming (WebSockets)

## License

MIT

## Support

For issues or questions:
- Check logs with `level: 'debug'`
- Review complexity analysis reasoning
- Verify workers service health
- Check queue statistics
