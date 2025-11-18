# Chef Architecture

## Overview

Chef is an AI-powered full-stack application builder with a monorepo architecture. This document describes the architecture after the refactoring.

## Monorepo Structure

```
chef/
├── apps/
│   └── web/                    # Frontend application (Remix/React)
├── packages/
│   ├── engine/                 # AI code generation engine
│   ├── compiler/               # Template compiler and renderer
│   ├── templates/              # Project templates
│   └── chef-agent/            # AI agent (legacy, being migrated)
├── services/
│   └── backend/               # Backend API and workers
├── infra/                      # Infrastructure configuration
├── convex/                     # Convex database functions
├── test-kitchen/              # Testing harness
└── chefshot/                  # CLI tool

```

## Core Components

### 1. Generation Engine (`packages/engine`)

The heart of Chef's code generation capabilities.

**Pipeline Flow:**
```
prompt → extraction → plan → génération → analyse → tests → build
```

**Components:**
- `intent-extractor`: Extracts user intent from natural language
- `plan-generator`: Creates execution plans
- `prompt-manager`: Optimizes prompts for code generation
- `code-generator`: Generates code using AI
- `static-analyzer`: Analyzes code for errors and security (OWASP)
- `test-generator`: Generates tests automatically
- `executor`: Runs code in sandbox environments

### 2. Compiler (`packages/compiler`)

Handles template rendering and file generation.

**Features:**
- Template parameterization with `metadata.json`
- Variable substitution
- Conditional file generation
- Automatic generation of README, CI config, .env.example

**Key Files:**
- `renderer.ts`: Template rendering engine
- `file-writer.ts`: File system operations
- `metadata.ts`: Metadata parsing and validation

### 3. Templates (`packages/templates`)

Pre-configured project templates.

**Available Templates:**
- **React + Convex**: Full-stack with Convex backend
- **React + Supabase**: Full-stack with Supabase backend
- **React + Node.js**: Full-stack with Node.js/Express backend

Each template includes:
- Project structure
- Pre-configured tooling
- Best practices
- TypeScript support
- TailwindCSS styling

### 4. Backend API (`services/backend`)

REST API for project management and build orchestration.

**Endpoints:**
```
POST   /v1/projects              # Create new project
GET    /v1/projects/:id/status   # Get project status
GET    /v1/projects/:id/logs     # Get build logs
POST   /v1/projects/:id/publish  # Publish project
POST   /v1/hooks/worker-result   # Worker callback webhook
```

**Architecture:**
- Express.js REST API
- BullMQ for job queue
- Redis for queue storage
- Docker sandbox for builds
- Structured JSON logging

### 5. Frontend (`apps/web`)

React/Remix application providing the user interface.

**Key Features:**
- Code editor with syntax highlighting
- Real-time preview
- File browser
- Terminal emulator
- Diff viewer
- Component library (planned)
- Drag & drop canvas (planned)

## Data Flow

### Code Generation Flow

1. **User Input**: User enters prompt in web UI
2. **API Request**: Frontend sends prompt to backend API
3. **Job Queue**: Backend queues generation job
4. **Worker Processing**:
   - Worker picks up job from queue
   - Runs generation engine pipeline
   - Updates status and logs in real-time
5. **Result Storage**: Completed code stored and made available
6. **User Notification**: Frontend polls for status updates
7. **Preview**: User can preview and edit generated code

### Worker Architecture

```
┌─────────────┐
│   API       │
│   Server    │
└─────┬───────┘
      │
      │ Queue Job
      ▼
┌─────────────┐      ┌──────────────┐
│   Redis     │◄────►│   BullMQ     │
│   Queue     │      │   Worker     │
└─────────────┘      └──────┬───────┘
                            │
                            │ Execute
                            ▼
                     ┌──────────────┐
                     │   Docker     │
                     │   Sandbox    │
                     └──────┬───────┘
                            │
                            │ Webhook
                            ▼
                     ┌──────────────┐
                     │   API        │
                     │   Callback   │
                     └──────────────┘
```

## Security

### Input Sanitization
- All user inputs are sanitized
- Prompt injection protection
- SQL injection prevention

### Content Security Policy (CSP)
- Strict CSP for iframe preview
- Sandboxed execution environment
- No inline scripts allowed

### Secrets Management
- Environment variables for sensitive data
- No hardcoded credentials
- Secure secret injection in workers

### OWASP Integration
- Static analysis checks OWASP rules
- Vulnerability scanning
- Security best practices enforcement

### Rate Limiting
- API rate limiting per user
- Queue throttling
- Resource usage limits

## Monitoring & Observability

### Structured Logging
All logs are structured JSON:
```json
{
  "level": "info",
  "message": "Project created",
  "timestamp": "2025-08-15T10:30:00Z",
  "data": {
    "projectId": "abc-123",
    "userId": "user-456"
  }
}
```

### Metrics (Planned)
- Sentry for error tracking
- Prometheus for metrics collection
- Grafana for visualization
- Usage analytics

## Development Workflow

### Local Development

```bash
# Install dependencies
pnpm install

# Run all services
pnpm run dev

# Run specific package
pnpm --filter @chef/engine dev

# Run tests
pnpm run test

# Run linting
pnpm run lint

# Type checking
pnpm run typecheck
```

### Building

```bash
# Build all packages
pnpm run build

# Build specific package
pnpm --filter @chef/engine build
```

### Testing

```bash
# Run all tests
pnpm run test

# Run tests for specific package
pnpm --filter @chef/engine test

# Watch mode
pnpm run test:watch
```

## CI/CD

### GitHub Actions Workflow

1. **Lint**: ESLint, Prettier
2. **TypeCheck**: TypeScript type checking
3. **Test**: Unit and integration tests
4. **Build**: Build all packages
5. **E2E** (planned): End-to-end tests with Playwright

### Deployment (Planned)

- Docker images for services
- Kubernetes orchestration
- Automated deployments
- Rollback capabilities

## Future Enhancements

### Sprint Roadmap

- ✅ **Sprint 0**: Monorepo + CI
- 🚧 **Sprint 1**: Engine MVP
- 📋 **Sprint 2**: Workers & Sandbox
- 📋 **Sprint 3**: Frontend/Editor MVP
- 📋 **Sprint 4**: Security + QA
- 📋 **Sprint 5**: UX + Templates
- 📋 **Sprint 6**: Monitoring & Release

### Planned Features

1. **Drag & Drop Canvas**: Visual component composition
2. **Component Library**: Pre-built components
3. **Visual Diff**: Side-by-side code comparison
4. **Live Collaboration**: Multi-user editing
5. **Version Control**: Built-in git integration
6. **Deployment Integration**: One-click deploy to Vercel, Netlify, etc.
7. **Template Marketplace**: Community-contributed templates

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on how to contribute to Chef.

## License

MIT License - see [LICENSE](./LICENSE) for details.
