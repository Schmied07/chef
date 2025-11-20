# Multi-stage build for Chef Backend
FROM node:18-alpine AS base

# Install pnpm
RUN npm install -g pnpm@9.5.0

# Install Python for AI service
RUN apk add --no-cache python3 py3-pip

# Install emergentintegrations
RUN pip3 install --no-cache-dir emergentintegrations python-dotenv

WORKDIR /app

# Copy workspace files
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/engine/package.json ./packages/engine/
COPY packages/compiler/package.json ./packages/compiler/
COPY services/backend/package.json ./services/backend/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/engine ./packages/engine
COPY packages/compiler ./packages/compiler
COPY services/backend ./services/backend

# Build packages
RUN pnpm --filter @chef/engine build
RUN pnpm --filter @chef/compiler build
RUN pnpm --filter @chef/backend build

# Production stage
FROM node:18-alpine AS production

# Install pnpm
RUN npm install -g pnpm@9.5.0

# Install Python and emergentintegrations
RUN apk add --no-cache python3 py3-pip docker-cli
RUN pip3 install --no-cache-dir emergentintegrations python-dotenv

WORKDIR /app

# Copy built artifacts
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/packages ./packages
COPY --from=base /app/services/backend/dist ./services/backend/dist
COPY --from=base /app/services/backend/package.json ./services/backend/
COPY --from=base /app/pnpm-workspace.yaml ./

# Create directories for builds and artifacts
RUN mkdir -p /tmp/chef-builds /tmp/chef-artifacts

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

WORKDIR /app/services/backend

# Start the server
CMD ["node", "dist/index.js"]