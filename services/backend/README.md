# @chef/backend

Backend API and Workers for Chef.

## Overview

Provides REST API for project management and background workers for code generation.

## API Endpoints

### Projects

```
POST   /v1/projects              # Create new project
GET    /v1/projects/:id/status   # Get project status
GET    /v1/projects/:id/logs     # Get build logs
POST   /v1/projects/:id/publish  # Publish project
```

### Webhooks

```
POST   /v1/hooks/worker-result   # Worker callback
```

## Architecture

- **Express.js**: REST API server
- **BullMQ**: Job queue for background processing
- **Redis**: Queue storage
- **Docker**: Sandboxed execution environment

## Configuration

Environment variables:

```env
PORT=3001
REDIS_HOST=localhost
REDIS_PORT=6379
WORKER_CONCURRENCY=5
NODE_ENV=development
```

## Development

```bash
# Start API server
pnpm dev

# Start workers
pnpm worker

# Run tests
pnpm test
```

## Worker Flow

1. API receives project creation request
2. Job is queued in Redis via BullMQ
3. Worker picks up job
4. Worker runs generation pipeline
5. Worker sends result via webhook
6. API updates project status

## License

MIT
