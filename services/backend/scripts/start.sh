#!/bin/bash

# Start script for Chef Backend
set -e

echo "🚀 Starting Chef Backend Services..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please run setup.sh first."
    exit 1
fi

# Start services with docker-compose
echo "\n📦 Starting services with Docker Compose..."
docker-compose up -d

echo "\n⏳ Waiting for services to be healthy..."
sleep 5

# Check health
echo "\n🏥 Checking service health..."

if docker-compose ps | grep -q "redis.*Up"; then
    echo "✅ Redis is running"
else
    echo "❌ Redis is not running"
fi

if docker-compose ps | grep -q "backend.*Up"; then
    echo "✅ Backend is running"
else
    echo "❌ Backend is not running"
fi

echo "\n🎉 All services started!"
echo "\n📝 Service URLs:"
echo "  - Backend API: http://localhost:3001"
echo "  - Health Check: http://localhost:3001/health"
echo "  - Redis: localhost:6379"
echo "\n📊 View logs: docker-compose logs -f"
echo "🛑 Stop services: docker-compose down"