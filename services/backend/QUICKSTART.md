# 🚀 Quick Start Guide - Chef Backend

This guide will help you get the Chef Backend up and running in minutes.

## Prerequisites

- **Docker** & **Docker Compose** (for Redis and containerized builds)
- **Node.js 18+** with **pnpm**
- **Python 3.8+** (for AI service)

## Option 1: Docker Compose (Recommended)

### 1. Setup Environment

```bash
cd /app/services/backend

# Copy environment file
cp .env.example .env

# Update .env with your credentials
# At minimum, set:
# - EMERGENT_LLM_KEY (for AI generation)
# - CONVEX_WEBHOOK_SECRET (for webhooks)
```

### 2. Start Services

```bash
# Build and start all services (Redis + Backend)
docker-compose up -d

# View logs
docker-compose logs -f

# Check health
curl http://localhost:3001/health
```

### 3. Test AI Generation

```bash
curl -X POST http://localhost:3001/v1/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Build a simple counter app with React",
    "config": {
      "enableAnalysis": true,
      "enableTests": false
    }
  }'
```

## Option 2: Development Mode

### 1. Run Setup Script

```bash
cd /app/services/backend
bash scripts/setup.sh
```

This will:
- ✅ Check dependencies
- ✅ Install Python packages (emergentintegrations)
- ✅ Install Node packages
- ✅ Build TypeScript packages
- ✅ Create build directories
- ✅ Copy .env file

### 2. Start Redis

```bash
docker-compose up -d redis
```

### 3. Start Backend

```bash
pnpm dev
```

The server will start on `http://localhost:3001`

### 4. Test the API

```bash
# Health check
curl http://localhost:3001/health

# Generate a project
bash examples/test-api.sh
```

## API Examples

### 1. Generate Project from Prompt

```bash
curl -X POST http://localhost:3001/v1/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Build a todo app with React and local storage",
    "config": {
      "enableAnalysis": true,
      "enableTests": true
    }
  }'
```

**Response**:
```json
{
  "projectId": "abc-123",
  "jobId": "xyz-456",
  "status": "queued",
  "filesGenerated": 12,
  "message": "Project generated and build queued successfully"
}
```

### 2. Check Build Status

```bash
curl http://localhost:3001/v1/projects/{projectId}/status
```

**Response**:
```json
{
  "id": "abc-123",
  "status": "completed",
  "progress": 100,
  "updatedAt": "2025-01-XX..."
}
```

### 3. Get Build Logs

```bash
curl http://localhost:3001/v1/projects/{projectId}/logs
```

### 4. List Artifacts

```bash
curl http://localhost:3001/v1/projects/{projectId}/artifacts
```

### 5. Download Artifact

```bash
curl -O http://localhost:3001/v1/projects/{projectId}/artifacts/dist
```

## Configuration

### Key Environment Variables

```env
# Required for AI Generation
EMERGENT_LLM_KEY=sk-emergent-9F51f0520965598045

# AI Provider (openai, anthropic, gemini)
AI_PROVIDER=openai
AI_MODEL=gpt-4o

# Worker Configuration
WORKER_CONCURRENCY=5        # Number of concurrent workers
WORKER_TIMEOUT=300000        # 5 minutes

# Docker Limits
DOCKER_MEMORY_LIMIT=512m     # Memory per container
DOCKER_CPU_LIMIT=1           # CPU cores per container
```

## Monitoring

### Check Service Health

```bash
curl http://localhost:3001/health
```

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2025-01-XX...",
  "services": {
    "redis": "up",
    "docker": "up"
  }
}
```

### View Logs

```bash
# Docker Compose logs
docker-compose logs -f backend

# Just errors
docker-compose logs -f backend | grep ERROR

# Specific service
docker-compose logs -f redis
```

## Testing

### Run Tests

```bash
# All tests
pnpm test

# Integration tests (requires Docker)
pnpm test:integration

# Using script
bash scripts/test.sh
```

### Manual API Testing

```bash
# Complete workflow test
bash examples/test-api.sh
```

## Common Issues

### 1. Docker not available

**Error**: `Docker is not available`

**Solution**:
```bash
# Check Docker is running
docker info

# Start Docker daemon (Mac)
open -a Docker

# Linux
sudo systemctl start docker
```

### 2. Redis connection failed

**Error**: `Redis connection failed`

**Solution**:
```bash
# Start Redis
docker-compose up -d redis

# Check Redis
docker-compose ps redis
redis-cli ping
```

### 3. AI Generation fails

**Error**: `AI generation failed`

**Solution**:
- Check `EMERGENT_LLM_KEY` is set in `.env`
- Verify Python and emergentintegrations are installed:
  ```bash
  python3 -c "import emergentintegrations"
  ```

### 4. Build timeout

**Error**: `Build timeout after 300000ms`

**Solution**:
- Increase timeout in `.env`:
  ```env
  WORKER_TIMEOUT=600000  # 10 minutes
  ```

## Stopping Services

### Docker Compose

```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Development Mode

```bash
# Ctrl+C to stop the dev server

# Stop Redis
docker-compose stop redis
```

## Next Steps

1. **Read the docs**: See [README.md](README.md) for detailed API documentation
2. **Check Sprint 2**: See [SPRINT2-COMPLETE.md](../../SPRINT2-COMPLETE.md) for architecture
3. **Customize builds**: Modify build strategies in your API calls
4. **Scale workers**: Increase `WORKER_CONCURRENCY` for more throughput
5. **Monitor metrics**: Add Prometheus/Grafana for production monitoring

## Support

- **Documentation**: `/app/services/backend/README.md`
- **Architecture**: `/app/ARCHITECTURE.md`
- **Issues**: Check logs with `docker-compose logs -f`

---

Happy coding! 🎉
