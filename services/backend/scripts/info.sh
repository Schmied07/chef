#!/bin/bash

# Information script - Display Chef Backend system info

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║              🚀 Chef Backend - System Information             ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Version and Status
echo -e "${BLUE}📦 Version Information${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Package: @chef/backend"
VERSION=$(grep '"version"' package.json | head -1 | sed 's/.*: "\(.*\)".*/\1/')
echo "Version: $VERSION"
echo "Sprint: 2 (Workers & Sandbox) ✅"
echo ""

# Dependencies Check
echo -e "${BLUE}🔧 Dependencies${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Docker
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version | cut -d' ' -f3 | tr -d ',')
    echo -e "Docker:        ${GREEN}✓${NC} $DOCKER_VERSION"
else
    echo -e "Docker:        ${RED}✗ Not installed${NC}"
fi

# Docker Compose
if command -v docker-compose &> /dev/null; then
    DC_VERSION=$(docker-compose --version | cut -d' ' -f4 | tr -d ',')
    echo -e "Docker Compose: ${GREEN}✓${NC} $DC_VERSION"
else
    echo -e "Docker Compose: ${RED}✗ Not installed${NC}"
fi

# Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "Node.js:       ${GREEN}✓${NC} $NODE_VERSION"
else
    echo -e "Node.js:       ${RED}✗ Not installed${NC}"
fi

# pnpm
if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm --version)
    echo -e "pnpm:          ${GREEN}✓${NC} $PNPM_VERSION"
else
    echo -e "pnpm:          ${RED}✗ Not installed${NC}"
fi

# Python
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
    echo -e "Python 3:      ${GREEN}✓${NC} $PYTHON_VERSION"
else
    echo -e "Python 3:      ${RED}✗ Not installed${NC}"
fi

# emergentintegrations
if python3 -c "import emergentintegrations" 2>/dev/null; then
    echo -e "emergentintegrations: ${GREEN}✓ Installed${NC}"
else
    echo -e "emergentintegrations: ${RED}✗ Not installed${NC}"
fi

echo ""

# Services Status
echo -e "${BLUE}🔌 Services Status${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if Docker Compose services are running
if docker-compose ps 2>/dev/null | grep -q "Up"; then
    if docker-compose ps | grep "redis" | grep -q "Up"; then
        echo -e "Redis:         ${GREEN}✓ Running${NC}"
    else
        echo -e "Redis:         ${RED}✗ Stopped${NC}"
    fi
    
    if docker-compose ps | grep "backend" | grep -q "Up"; then
        echo -e "Backend:       ${GREEN}✓ Running${NC}"
    else
        echo -e "Backend:       ${RED}✗ Stopped${NC}"
    fi
else
    echo -e "Docker Services: ${YELLOW}⚠ Not started${NC}"
fi

echo ""

# Configuration
echo -e "${BLUE}⚙️  Configuration${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f .env ]; then
    echo -e ".env file:     ${GREEN}✓ Present${NC}"
    
    # Check key variables
    if grep -q "EMERGENT_LLM_KEY=sk-emergent" .env 2>/dev/null; then
        echo -e "AI Key:        ${GREEN}✓ Configured${NC}"
    else
        echo -e "AI Key:        ${YELLOW}⚠ Not configured${NC}"
    fi
    
    if grep -q "REDIS_HOST=" .env 2>/dev/null; then
        REDIS_HOST=$(grep "REDIS_HOST=" .env | cut -d'=' -f2)
        echo "Redis Host:    $REDIS_HOST"
    fi
    
    if grep -q "WORKER_CONCURRENCY=" .env 2>/dev/null; then
        WORKERS=$(grep "WORKER_CONCURRENCY=" .env | cut -d'=' -f2)
        echo "Workers:       $WORKERS"
    fi
else
    echo -e ".env file:     ${RED}✗ Missing${NC}"
fi

echo ""

# Features
echo -e "${BLUE}✨ Features${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✓ AI Code Generation"
echo "✓ Docker Sandbox Builds"
echo "✓ BullMQ Job Queue"
echo "✓ Artifact Management"
echo "✓ Real-time Build Logs"
echo "✓ Webhook Integration"
echo "✓ Health Monitoring"
echo "✓ Metrics Collection"
echo ""

# API Endpoints
echo -e "${BLUE}🌐 API Endpoints${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "POST   /v1/generate"
echo "POST   /v1/projects"
echo "GET    /v1/projects/:id/status"
echo "GET    /v1/projects/:id/logs"
echo "GET    /v1/projects/:id/artifacts"
echo "POST   /v1/projects/:id/publish"
echo "POST   /v1/hooks/worker-result"
echo "GET    /health"
echo "GET    /metrics"
echo ""

# Quick Commands
echo -e "${BLUE}📝 Quick Commands${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Setup:         bash scripts/setup.sh"
echo "Start:         docker-compose up -d"
echo "Dev Mode:      pnpm dev"
echo "Logs:          docker-compose logs -f"
echo "Monitor:       bash examples/monitor.sh"
echo "Test:          pnpm test"
echo "Test API:      bash examples/test-api.sh"
echo "Stop:          docker-compose down"
echo ""

# Documentation
echo -e "${BLUE}📚 Documentation${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "README:        services/backend/README.md"
echo "Quick Start:   services/backend/QUICKSTART.md"
echo "Sprint 2:      SPRINT2-COMPLETE.md"
echo "Architecture:  ARCHITECTURE.md"
echo "Changelog:     CHANGELOG.md"
echo ""

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                    System Info Complete                       ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
