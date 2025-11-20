# @chef/backend

Backend API and Workers for Chef with Docker Sandbox & AI Integration.

## 🎯 Overview

Provides REST API for project management, AI code generation, and background workers with isolated Docker builds.

## 🚀 Features

- ✅ **AI Code Generation** - Integration with `@chef/engine`
- ✅ **Docker Sandbox** - Isolated builds with resource limits
- ✅ **BullMQ Queue** - Robust job queue with Redis
- ✅ **Build Pipeline** - 5-phase build process
- ✅ **Artifact Management** - Collection and download of build outputs
- ✅ **Webhook Integration** - Notify Convex on completion
- ✅ **Health Checks** - Monitor system health
- ✅ **Production Ready** - Docker Compose setup

## 📡 API Endpoints

### AI Generation

```http
POST   /v1/generate               # Generate project from prompt
```

**Example**:
```bash
curl -X POST http://localhost:3001/v1/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Build a todo app with React and Convex",
    "config": {
      "enableAnalysis": true,
      "enableTests": true
    }
  }'
```

### Projects

```http
POST   /v1/projects               # Create project (manual)
GET    /v1/projects/:id/status    # Get build status
GET    /v1/projects/:id/logs      # Get build logs
POST   /v1/projects/:id/publish   # Publish project
```

### Artifacts

```http
GET    /v1/projects/:id/artifacts        # List artifacts
GET    /v1/projects/:id/artifacts/:name  # Download artifact
```

### Webhooks

```http
POST   /v1/hooks/worker-result    # Worker callback
```

### System

```http
GET    /health                     # System health check
```

## 🏗️ Architecture

```
Client → API → BullMQ Queue → Worker → Docker Sandbox → Artifacts
              ↓
         @chef/engine (AI)
```

### Components

- **Express.js** - REST API server
- **BullMQ** - Job queue with retry & backoff
- **Redis** - Queue persistence
- **Docker** - Isolated build execution
- **@chef/engine** - AI code generation
- **emergentintegrations** - Multi-LLM support

### Build Pipeline Phases

1. **Prepare** (10%) - Create filesystem
2. **Install** (30%) - Install dependencies
3. **Build** (60%) - Execute build command
4. **Artifacts** (90%) - Collect outputs
5. **Cleanup** (100%) - Remove containers

## ⚙️ Configuration

### Environment Variables

```env
# Server
PORT=3001
NODE_ENV=development

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Worker
WORKER_CONCURRENCY=5
WORKER_TIMEOUT=300000

# Docker
DOCKER_HOST=unix:///var/run/docker.sock
DOCKER_MEMORY_LIMIT=512m
DOCKER_CPU_LIMIT=1

# Build
BUILD_DIR=/tmp/chef-builds
ARTIFACTS_DIR=/tmp/chef-artifacts

# Convex
CONVEX_URL=https://api.convex.dev
CONVEX_WEBHOOK_SECRET=

# AI (Emergent)
EMERGENT_LLM_KEY=sk-emergent-9F51f0520965598045
AI_PROVIDER=openai
AI_MODEL=gpt-4o
```

## 🚀 Quick Start

### Setup

```bash
# Run setup script
pnpm setup

# Or manually:
# 1. Install dependencies
pnpm install

# 2. Copy .env
cp .env.example .env

# 3. Update .env with your credentials
```

### Development

```bash
# Start Redis
docker-compose up -d redis

# Start API + Worker (dev mode)
pnpm dev
```

### Production

```bash
# Start all services with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run integration tests (requires Docker)
pnpm test:integration

# Run with script
bash scripts/test.sh
```

## 🔄 Worker Flow

### AI Generation Flow

1. Client sends prompt to `/v1/generate`
2. Backend calls `@chef/engine` to generate code
3. AI extracts intent → generates plan → generates code
4. Backend creates BuildJob from AI results
5. Job is queued in Redis via BullMQ
6. Worker picks up job
7. Docker processor executes 5-phase build
8. Worker sends result via webhook to Convex
9. API updates project status

### Manual Build Flow

1. Client sends files to `/v1/projects`
2. Backend creates BuildJob
3. Job is queued (steps 5-9 same as above)

## 🐳 Docker

### Build Image

```bash
pnpm docker:build
```

### Run Services

```bash
pnpm docker:up
```

### View Logs

```bash
pnpm docker:logs
```

## 📊 Resource Limits

| Resource | Default | Configurable |
|----------|---------|--------------|
| Memory | 512MB | `DOCKER_MEMORY_LIMIT` |
| CPU | 1 core | `DOCKER_CPU_LIMIT` |
| Timeout | 5 min | `WORKER_TIMEOUT` |
| Workers | 5 | `WORKER_CONCURRENCY` |

## 🔒 Security

- ✅ Docker container isolation
- ✅ Network access disabled (`NetworkMode: 'none'`)
- ✅ Resource limits enforced
- ✅ Automatic container cleanup
- ✅ Webhook authentication
- ✅ Input validation

## 📚 Documentation

- [Architecture](../../ARCHITECTURE.md)
- [Sprint 0 Complete](../../SPRINT0-COMPLETE.md)
- [Sprint 1 Complete](../../SPRINT1-COMPLETE.md)
- [Sprint 2 Complete](../../SPRINT2-COMPLETE.md)

## 📝 Scripts

```bash
pnpm dev              # Start in development mode
pnpm build            # Build TypeScript
pnpm start            # Start production server
pnpm test             # Run tests
pnpm test:integration # Run integration tests
pnpm typecheck        # TypeScript check
pnpm setup            # Initial setup
pnpm docker:build     # Build Docker image
pnpm docker:up        # Start with Docker Compose
pnpm docker:down      # Stop Docker services
pnpm docker:logs      # View Docker logs
```

## 🎯 Next Steps

See [SPRINT2-COMPLETE.md](../../SPRINT2-COMPLETE.md) for:
- Complete architecture diagrams
- Detailed flow explanations
- Testing strategies
- Deployment guides
- Performance metrics

## 📄 License

MIT
