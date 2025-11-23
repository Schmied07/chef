/**
 * Auto-generation utilities
 * Sprint 5.3 - Auto-generation features
 */

import type { TemplateMetadata, TemplateConfig } from '../metadata/types';
import { TemplateEngine } from './templateEngine';

export class AutoGenerator {
  private engine: TemplateEngine;

  constructor(config: TemplateConfig) {
    this.engine = new TemplateEngine(config);
  }

  /**
   * Generate GitHub Actions CI/CD workflow
   */
  generateCIWorkflow(metadata: TemplateMetadata): string {
    const projectName = this.engine.processTemplate('{{projectName}}');
    
    return `name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linter
      run: npm run lint
    
    - name: Run type check
      run: npm run typecheck
    
    - name: Run tests
      run: npm test
    
    - name: Build
      run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Deploy to production
      run: |
        echo "Deploy ${projectName} to production"
        # Add your deployment commands here
`;
  }

  /**
   * Generate docker-compose.yml
   */
  generateDockerCompose(metadata: TemplateMetadata): string {
    const services: string[] = [];

    // Add app service
    services.push(`  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
    volumes:
      - .:/app
      - /app/node_modules
    depends_on:
      - db`);

    // Add database service if needed
    if (metadata.variables.database) {
      const dbType = metadata.variables.database.default;
      
      if (dbType === 'mongodb') {
        services.push(`  db:
    image: mongo:7
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=password
    volumes:
      - mongo-data:/data/db`);
      } else if (dbType === 'postgresql') {
        services.push(`  db:
    image: postgres:16
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=admin
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=myapp
    volumes:
      - postgres-data:/var/lib/postgresql/data`);
      }
    }

    // Add Redis if needed
    const hasRedis = metadata.dependencies.optional['redis'];
    if (hasRedis) {
      services.push(`  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data`);
    }

    const volumes = `\nvolumes:
  mongo-data:
  postgres-data:
  redis-data:`;

    return `version: '3.8'

services:
${services.join('\n\n')}${volumes}
`;
  }

  /**
   * Generate API documentation
   */
  generateAPIDocumentation(metadata: TemplateMetadata): string {
    const projectName = this.engine.processTemplate('{{projectName}}');

    return `# ${projectName} API Documentation

## Base URL

\`\`\`
http://localhost:3000/api
\`\`\`

## Authentication

${metadata.features.find(f => f.id === 'auth') ? `
All API requests require authentication via JWT token:

\`\`\`
Authorization: Bearer <token>
\`\`\`
` : 'No authentication required for this API.'}

## Endpoints

### Health Check

\`\`\`http
GET /health
\`\`\`

**Response:**
\`\`\`json
{
  "status": "ok",
  "timestamp": "2025-01-15T10:00:00Z"
}
\`\`\`

### Example Endpoints

\`\`\`http
GET /api/items
POST /api/items
GET /api/items/:id
PUT /api/items/:id
DELETE /api/items/:id
\`\`\`

## Error Handling

All errors follow this format:

\`\`\`json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {}
  }
}
\`\`\`

## Rate Limiting

- 100 requests per minute per IP
- 1000 requests per hour per authenticated user

---

*Generated with Chef*
`;
  }

  /**
   * Generate Dockerfile
   */
  generateDockerfile(metadata: TemplateMetadata): string {
    return `FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source files
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
`;
  }

  /**
   * Generate .gitignore
   */
  generateGitignore(): string {
    return `# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/
.nyc_output/

# Production
build/
dist/
.next/
out/

# Environment
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Misc
.cache/
.temp/
.tmp/
`;
  }

  /**
   * Generate ESLint config
   */
  generateESLintConfig(): string {
    return `{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "plugins": ["@typescript-eslint", "react", "react-hooks"],
  "rules": {
    "react/react-in-jsx-scope": "off",
    "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }]
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  }
}
`;
  }
}
