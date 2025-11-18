# Chef - AI-Powered Full-Stack App Builder

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://chef.convex.dev/github-header-dark.svg">
    <img alt="Chef by Convex'" src="https://chef.convex.dev/github-header-light.svg" width="600">
  </picture>
</p>

**Chef** is the only AI app builder that truly understands backend development. Build production-ready full-stack web applications with:

- 🗄️ Built-in reactive database (Convex)
- 🔐 Zero-config authentication
- 📁 File uploads and storage
- ⚡ Real-time UI updates
- 🔄 Background workflows and jobs
- 🎨 Modern UI with TailwindCSS
- 🔒 Security-first approach (OWASP)

> **Note**: This is the refactored monorepo version of Chef. For the original version, see the `stable` branch.

## 🚀 Features

### AI-Powered Code Generation

Chef uses advanced AI models to generate complete, production-ready applications from natural language descriptions:

```
You: "Build a todo app with user authentication and real-time sync"

Chef: Generates a full React + Convex app with:
  ✅ User authentication
  ✅ Real-time todo synchronization
  ✅ CRUD operations
  ✅ Responsive UI
  ✅ Type-safe API
  ✅ Tests
```

### Generation Pipeline

Chef uses a sophisticated pipeline to ensure high-quality code:

```
📝 Prompt → 🔍 Intent Extraction → 📋 Plan Generation → 
🔨 Code Generation → 🔬 Static Analysis → 🧪 Test Generation → 
🚀 Execution & Validation
```

### Built on Convex

Chef's "magic" comes from being built on [Convex](https://convex.dev), the open-source reactive database designed for modern web apps. Convex provides:

- Real-time database queries
- Serverless functions
- Authentication
- File storage
- Scheduled jobs
- Full-stack type safety

## 📦 Monorepo Structure

```
chef/
├── apps/
│   └── web/                # Frontend (Remix/React)
├── packages/
│   ├── engine/            # AI generation engine
│   ├── compiler/          # Template compiler
│   ├── templates/         # Project templates
│   └── chef-agent/       # AI agent system
├── services/
│   └── backend/          # API & Workers
├── convex/               # Database functions
├── test-kitchen/         # Testing harness
└── chefshot/            # CLI tool
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture documentation.

## 🛠️ Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9.5.0+
- Docker (for workers)
- Redis (for job queue)

### Installation

```bash
# Clone the repository
git clone https://github.com/get-convex/chef.git
cd chef

# Checkout the monorepo branch
git checkout refactor/monorepo

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys
```

### Configuration

Add your AI provider API keys to `.env.local`:

```env
# AI Providers (at least one required)
ANTHROPIC_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
GOOGLE_API_KEY=your_key_here

# Redis (for job queue)
REDIS_HOST=localhost
REDIS_PORT=6379

# Convex
VITE_CONVEX_URL=your_convex_url
```

### Running Locally

```bash
# Start all services
pnpm run dev

# Or start services individually:

# Terminal 1: Frontend
pnpm --filter @chef/web dev

# Terminal 2: Backend API
pnpm --filter @chef/backend dev

# Terminal 3: Convex
npx convex dev
```

Visit http://127.0.0.1:5173 to use Chef locally.

## 🏗️ Development

### Project Structure

- **apps/web**: React/Remix frontend application
- **packages/engine**: Core AI code generation engine
- **packages/compiler**: Template rendering and file generation
- **packages/templates**: Pre-built project templates
- **services/backend**: REST API and background workers

### Available Commands

```bash
# Development
pnpm run dev           # Start all services
pnpm run build         # Build all packages
pnpm run test          # Run all tests
pnpm run lint          # Lint code
pnpm run typecheck     # Type check

# Package-specific commands
pnpm --filter @chef/engine test
pnpm --filter @chef/backend dev
```

### Testing

```bash
# Run all tests
pnpm run test

# Run tests for a specific package
pnpm --filter @chef/engine test

# Watch mode
pnpm run test:watch
```

### Linting

```bash
# Lint all code
pnpm run lint

# Auto-fix issues
pnpm run lint:fix
```

## 📚 Documentation

- [Architecture Guide](./ARCHITECTURE.md) - Detailed system architecture
- [Contributing Guide](./CONTRIBUTING.md) - How to contribute
- [Chef Cookbook](https://stack.convex.dev/chef-cookbook-tips-working-with-ai-app-builders) - Tips for using Chef
- [Convex Docs](https://docs.convex.dev) - Convex documentation

## 🔒 Security

Chef takes security seriously:

- ✅ Input sanitization and validation
- ✅ Strict Content Security Policy (CSP)
- ✅ OWASP security rules in static analysis
- ✅ Secrets managed via environment variables
- ✅ Rate limiting on API endpoints
- ✅ Sandboxed code execution

See [SECURITY.md](./SECURITY.md) for our security policy.

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for details on:

- Setting up your development environment
- Coding standards and guidelines
- Submitting pull requests
- Reporting bugs and issues

## 📊 API Reference

### Backend API Endpoints

```
POST   /v1/projects              Create new project
GET    /v1/projects/:id/status   Get project status
GET    /v1/projects/:id/logs     Get build logs
POST   /v1/projects/:id/publish  Publish project
```

See [API.md](./docs/API.md) for full API documentation.

## 🗺️ Roadmap

- ✅ Sprint 0: Monorepo setup + CI/CD
- 🚧 Sprint 1: Engine MVP
- 📋 Sprint 2: Docker workers & sandbox
- 📋 Sprint 3: Frontend editor improvements
- 📋 Sprint 4: Security & QA
- 📋 Sprint 5: UX enhancements & templates
- 📋 Sprint 6: Monitoring & production release

## 💬 Community

- [Discord](https://discord.gg/convex) - Join our Discord community
- [GitHub Discussions](https://github.com/get-convex/chef/discussions) - Ask questions and share ideas
- [Twitter](https://twitter.com/convex_dev) - Follow us for updates

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

## 🙏 Acknowledgments

- Built on top of [Convex](https://convex.dev)
- Originally forked from [bolt.diy](https://github.com/stackblitz-labs/bolt.diy)
- Powered by AI models from OpenAI, Anthropic, and Google

## 🔗 Links

- [Homepage](https://chef.convex.dev)
- [Documentation](https://docs.convex.dev/chef)
- [GitHub](https://github.com/get-convex/chef)
- [Convex Platform](https://convex.dev)

---

Made with ❤️ by the [Convex](https://convex.dev) team
