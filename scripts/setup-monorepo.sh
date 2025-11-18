#!/bin/bash

# Setup script for Chef monorepo
# This script helps set up the development environment

set -e

echo "🚀 Setting up Chef monorepo..."

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
  echo "❌ Node.js 20 or higher is required (current: $(node -v))"
  exit 1
fi
echo "✅ Node.js version check passed"

# Check pnpm installation
if ! command -v pnpm &> /dev/null; then
  echo "📦 Installing pnpm..."
  npm install -g pnpm@9.5.0
else
  echo "✅ pnpm is installed"
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Set up environment file if it doesn't exist
if [ ! -f .env.local ]; then
  echo "📝 Creating .env.local file..."
  cat > .env.local << 'EOF'
# AI Provider Keys (at least one required)
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
GOOGLE_API_KEY=
XAI_API_KEY=

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# Worker Configuration
WORKER_CONCURRENCY=5

# Convex Configuration
VITE_CONVEX_URL=
CONVEX_DEPLOYMENT=

# Node Environment
NODE_ENV=development
EOF
  echo "⚠️  Please edit .env.local and add your API keys"
else
  echo "✅ .env.local already exists"
fi

# Check Docker installation
if ! command -v docker &> /dev/null; then
  echo "⚠️  Docker is not installed. It's required for running workers."
  echo "   Install from: https://docs.docker.com/get-docker/"
else
  echo "✅ Docker is installed"
fi

# Check Redis installation
if ! command -v redis-cli &> /dev/null; then
  echo "⚠️  Redis is not installed. It's required for job queue."
  echo "   Install with: brew install redis (macOS) or apt-get install redis (Linux)"
else
  echo "✅ Redis is installed"
fi

# Run type check
echo "🔍 Running type check..."
pnpm run typecheck

echo ""
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Edit .env.local and add your API keys"
echo "  2. Start Redis: redis-server"
echo "  3. Start Convex: npx convex dev"
echo "  4. Start the app: pnpm run dev"
echo ""
echo "For more information, see README.md"
