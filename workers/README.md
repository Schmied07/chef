# Chef Workers Service

External build workers service for Chef - Handles heavy build tasks with Docker isolation and BullMQ job queue.

## Architecture

```
Convex Backend
    ↓
@chef/engine
    ↓
Workers API (HTTP)
    ↓
BullMQ Queue
    ↓
Docker Workers
    ↓
Webhook → Convex
```

## Features

- **Job Queue**: BullMQ with Redis for reliable job processing
- **Docker Isolation**: Each job runs in isolated Docker container
- **Priority Handling**: Support for different job priorities
- **Retry Logic**: Automatic retry with exponential backoff
- **Progress Updates**: Real-time progress tracking
- **Webhook Callbacks**: Results sent back to Convex
- **Resource Limits**: CPU and memory limits per worker

## Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- pnpm 9+

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
```

### Development

```bash
# Start Redis and workers with Docker Compose
docker-compose up -d

# Or run locally (requires Redis running)
pnpm run dev

# Check logs
docker-compose logs -f workers
```

### Production Build

```bash
# Build TypeScript
pnpm run build

# Start production server
pnpm start
```

## API Endpoints

### Health Check
```bash
GET /api/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-20T10:00:00.000Z",
  "redis": "connected"
}
```

### Create Job
```bash
POST /api/jobs
Content-Type: application/json

{
  "type": "build",
  "priority": 5,
  "data": {
    "chatId": "chat-123",
    "projectFiles": {
      "index.js": "console.log('Hello');"
    },
    "dependencies": {
      "react": "^18.0.0"
    }
  }
}
```

Response:
```json
{
  "jobId": "job-abc123",
  "type": "build",
  "status": "pending",
  "createdAt": "2025-01-20T10:00:00.000Z"
}
```

### Get Job Status
```bash
GET /api/jobs/:id
```

Response:
```json
{
  "jobId": "job-abc123",
  "type": "build",
  "status": "completed",
  "progress": 100,
  "createdAt": "2025-01-20T10:00:00.000Z",
  "finishedAt": "2025-01-20T10:00:30.000Z"
}
```

### Get Queue Statistics
```bash
GET /api/stats
```

Response:
```json
{
  "timestamp": "2025-01-20T10:00:00.000Z",
  "queues": {
    "builds": {
      "waiting": 5,
      "active": 2,
      "completed": 100,
      "failed": 3
    },
    "tests": { ... },
    "lint": { ... }
  }
}
```

## Job Types

### Build Job
- Installs dependencies
- Builds the project
- Captures build logs
- Returns artifacts

### Test Job
- Runs test suite
- Captures test results
- Returns coverage data

### Lint Job
- Runs linter
- Static code analysis
- Returns issues found

## Configuration

All configuration is done via environment variables. See `.env.example` for all available options.

### Key Variables

- `REDIS_HOST`: Redis server host
- `REDIS_PORT`: Redis server port
- `PORT`: Workers API port
- `CONVEX_URL`: Convex deployment URL for webhooks
- `WORKER_MEMORY_LIMIT`: Memory limit per worker (e.g., "512m")
- `WORKER_CPU_LIMIT`: CPU limit per worker (e.g., 1)
- `MAX_CONCURRENT_WORKERS`: Maximum concurrent workers

## Monitoring

### Redis Commander (Debug Mode)

```bash
# Start with Redis Commander UI
docker-compose --profile debug up -d

# Access at http://localhost:8081
```

### Queue Monitoring

Use the `/api/stats` endpoint to monitor queue health and job counts.

## Development

### Project Structure

```
workers/
├── src/
│   ├── api/              # HTTP API routes
│   ├── config/           # Configuration
│   ├── queue/            # BullMQ setup and processors
│   ├── webhook/          # Convex webhooks
│   ├── types/            # TypeScript types
│   └── index.ts          # Entry point
├── Dockerfile
├── docker-compose.yml
├── package.json
└── tsconfig.json
```

### Testing

```bash
# Run tests
pnpm test

# Watch mode
pnpm test:watch
```

## Troubleshooting

### Redis Connection Issues

1. Check if Redis is running: `docker-compose ps`
2. Test connection: `redis-cli -h localhost -p 6379 ping`
3. Check logs: `docker-compose logs redis`

### Worker Not Processing Jobs

1. Check worker logs: `docker-compose logs workers`
2. Verify Redis connection
3. Check queue stats: `curl http://localhost:3001/api/stats`

### Docker Socket Permission

If you get Docker socket permission errors:

```bash
sudo chmod 666 /var/run/docker.sock
```

## Next Steps (Future Sprints)

- [ ] Docker worker implementation (Phase 3)
- [ ] Advanced retry strategies
- [ ] Dead letter queue handling
- [ ] Metrics and observability
- [ ] Authentication for webhooks
- [ ] Rate limiting
- [ ] Job scheduling

## License

MIT
