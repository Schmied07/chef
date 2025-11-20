#!/bin/bash

# Setup script for Chef Backend
set -e

echo "🚀 Setting up Chef Backend..."

# Check dependencies
echo "\n📋 Checking dependencies..."

if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Installing pnpm..."
    npm install -g pnpm@9.5.0
fi

if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

echo "✅ All dependencies installed"

# Install Python dependencies
echo "\n📦 Installing Python dependencies..."
pip3 install emergentintegrations python-dotenv

# Install Node dependencies
echo "\n📦 Installing Node dependencies..."
cd ../../
pnpm install

# Build packages
echo "\n🔨 Building packages..."
pnpm --filter @chef/engine build
pnpm --filter @chef/compiler build
pnpm --filter @chef/backend build

# Create directories
echo "\n📁 Creating build directories..."
mkdir -p /tmp/chef-builds
mkdir -p /tmp/chef-artifacts

# Check .env file
if [ ! -f services/backend/.env ]; then
    echo "\n⚠️  .env file not found. Copying from .env.example..."
    cp services/backend/.env.example services/backend/.env
    echo "✅ .env file created. Please update it with your credentials."
fi

echo "\n✅ Setup complete!"
echo "\n📝 Next steps:"
echo "  1. Update services/backend/.env with your configuration"
echo "  2. Start Redis: docker-compose up -d redis"
echo "  3. Start backend: pnpm --filter @chef/backend dev"
echo "  4. Or use Docker: docker-compose up"