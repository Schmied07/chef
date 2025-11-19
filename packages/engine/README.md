# @chef/engine

AI Code Generation Engine for Chef with Emergent Universal API integration.

## Overview

The engine package contains the core AI-powered code generation pipeline that transforms natural language prompts into working code using the Emergent Universal API.

## Pipeline Flow

```
prompt → extraction → plan → génération → analyse → tests → build
```

## Components

- **intent-extractor**: Extracts structured intent from user prompts using AI
- **plan-generator**: Creates detailed execution plans using AI
- **prompt-manager**: Optimizes prompts for better code generation
- **code-generator**: Generates code using AI models (OpenAI, Anthropic, Google)
- **static-analyzer**: Analyzes code for errors and security issues (OWASP)
- **test-generator**: Generates automated tests using AI
- **executor**: Runs code in sandbox environments
- **ai-service**: Python service using emergentintegrations library

## AI Integration

This package uses the **Emergent Universal API** which provides access to multiple AI providers:
- OpenAI (gpt-4o, gpt-5.1, o1, o3)
- Anthropic (claude-sonnet-4-5, claude-4-opus)
- Google Gemini (gemini-2.5-pro, gemini-2.5-flash)

### Setup

1. Set your Emergent API key:
```bash
export EMERGENT_LLM_KEY=your-key-here
```

2. Install Python dependencies:
```bash
cd ai-service
pip install -r requirements.txt
```

3. Configure provider (optional):
```bash
export AI_PROVIDER=openai  # or anthropic, gemini
export AI_MODEL=gpt-4o     # model name
```

## Usage

### Basic Usage

```typescript
import { runPipeline } from '@chef/engine';

const result = await runPipeline({
  text: 'Build a todo app with authentication',
  timestamp: new Date(),
});

if (result.success) {
  console.log('Generated files:', result.code.files);
  console.log('Dependencies:', result.code.dependencies);
}
```

### Advanced Usage

```typescript
import { runPipeline } from '@chef/engine';

const result = await runPipeline(
  {
    text: 'Build a blog with comments',
    timestamp: new Date(),
  },
  {
    enableAnalysis: true,  // Run static analysis
    enableTests: true,      // Generate tests
    enableExecution: false, // Don't execute code
    model: 'gpt-5.1',      // Use specific model
  }
);

if (result.success) {
  console.log('Intent:', result.intent);
  console.log('Plan:', result.plan);
  console.log('Code:', result.code);
  console.log('Analysis:', result.analysis);
  console.log('Tests:', result.tests);
}
```

### Individual Components

```typescript
import { extractIntent, generatePlan, generateCode } from '@chef/engine';

// Extract intent
const intent = await extractIntent({
  text: 'Build a chat app',
  timestamp: new Date(),
});

// Generate plan
const plan = await generatePlan(intent);

// Generate code
const code = await generateCode(plan, 'Use React and Convex');
```

## Architecture

```
TypeScript (Node.js)
    ↓
AI Bridge (spawn Python)
    ↓
Python AI Service
    ↓
emergentintegrations
    ↓
Emergent Universal API
    ↓
AI Providers (OpenAI/Anthropic/Google)
```

## Development

```bash
# Install dependencies
pnpm install

# Install Python dependencies
cd ai-service && pip install -r requirements.txt

# Run tests
pnpm test

# Type check
pnpm typecheck

# Build
pnpm build

# Test AI service
python ai-service/ai_service.py extract_intent '{"prompt": "test"}'
```

## Environment Variables

```bash
# Required
EMERGENT_LLM_KEY=sk-emergent-xxx

# Optional
AI_PROVIDER=openai          # openai, anthropic, gemini
AI_MODEL=gpt-4o            # model name
NODE_ENV=development        # development, production
```

## Error Handling

The engine includes comprehensive error handling with fallbacks:
- If AI service fails, returns sensible defaults
- If JSON parsing fails, uses regex extraction
- If provider is unavailable, falls back to basic extraction

## License

MIT
