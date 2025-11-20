#!/bin/bash

# Test script for Chef Backend
set -e

echo "🧪 Running Chef Backend Tests..."

# Check if Redis is running
if ! docker-compose ps | grep -q "redis.*Up"; then
    echo "⚠️  Redis is not running. Starting Redis..."
    docker-compose up -d redis
    sleep 3
fi

# Run unit tests
echo "\n📋 Running unit tests..."
pnpm test

# Run integration tests (if Docker is available)
if docker info &> /dev/null; then
    echo "\n🐳 Running integration tests..."
    pnpm test:integration
else
    echo "\n⚠️  Docker is not available. Skipping integration tests."
fi

echo "\n✅ All tests passed!"