# @chef/engine

AI Code Generation Engine for Chef.

## Overview

The engine package contains the core AI-powered code generation pipeline that transforms natural language prompts into working code.

## Pipeline Flow

```
prompt → extraction → plan → génération → analyse → tests → build
```

## Components

- **intent-extractor**: Extracts structured intent from user prompts
- **plan-generator**: Creates detailed execution plans
- **prompt-manager**: Optimizes prompts for better code generation
- **code-generator**: Generates code using AI models
- **static-analyzer**: Analyzes code for errors and security issues
- **test-generator**: Generates automated tests
- **executor**: Runs code in sandbox environments

## Usage

```typescript
import { runPipeline } from '@chef/engine';

const result = await runPipeline({
  text: 'Build a todo app with authentication',
  timestamp: new Date(),
});

if (result.success) {
  console.log('Generated files:', result.code.files);
}
```

## Development

```bash
# Run tests
pnpm test

# Type check
pnpm typecheck

# Build
pnpm build
```

## License

MIT
