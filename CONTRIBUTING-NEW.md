# Contributing to Chef

Thank you for your interest in contributing to Chef! This document provides guidelines and instructions for contributing to the project.

## 🎯 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Community](#community)

## 📜 Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please read and follow our [Code of Conduct](./CODE_OF_CONDUCT.md).

## 🚀 Getting Started

### Prerequisites

- Node.js 20 or higher
- pnpm 9.5.0 or higher
- Git
- Docker (for running workers locally)
- Redis (for job queue)

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:

```bash
git clone https://github.com/YOUR_USERNAME/chef.git
cd chef
```

3. Add the upstream repository:

```bash
git remote add upstream https://github.com/get-convex/chef.git
```

### Install Dependencies

```bash
# Install all dependencies
pnpm install

# Verify installation
pnpm run typecheck
```

### Set Up Environment

1. Copy the example environment file:

```bash
cp .env.example .env.local
```

2. Add your API keys and configuration to `.env.local`:

```env
# AI Provider Keys (at least one required)
ANTHROPIC_API_KEY=your_key
OPENAI_API_KEY=your_key
GOOGLE_API_KEY=your_key

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# Convex
VITE_CONVEX_URL=your_convex_deployment_url
```

### Run Local Development

```bash
# Start all services
pnpm run dev

# Or run services individually:
pnpm --filter @chef/web dev        # Frontend
pnpm --filter @chef/backend dev    # Backend API
npx convex dev                      # Convex database
```

## 🔄 Development Workflow

### Creating a Branch

Always create a new branch for your work:

```bash
# Update your fork
git checkout main
git pull upstream main

# Create a feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

### Making Changes

1. Make your changes in the appropriate package
2. Write or update tests as needed
3. Ensure all tests pass
4. Update documentation if needed

### Testing Your Changes

```bash
# Run all tests
pnpm run test

# Run tests for specific package
pnpm --filter @chef/engine test

# Run tests in watch mode
pnpm run test:watch

# Type checking
pnpm run typecheck

# Linting
pnpm run lint
```

### Committing Changes

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Format: <type>(<scope>): <description>

git commit -m "feat(engine): add intent extraction"
git commit -m "fix(backend): resolve queue processing issue"
git commit -m "docs(readme): update installation instructions"
git commit -m "test(compiler): add template rendering tests"
```

**Commit Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `test`: Adding or updating tests
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `chore`: Maintenance tasks
- `ci`: CI/CD changes

## 📁 Project Structure

```
chef/
├── apps/
│   └── web/              # Frontend application
├── packages/
│   ├── engine/          # Code generation engine
│   ├── compiler/        # Template compiler
│   ├── templates/       # Project templates
│   └── chef-agent/     # AI agent (legacy)
├── services/
│   └── backend/        # Backend API & workers
├── convex/             # Convex database
├── test-kitchen/       # Testing harness
└── chefshot/          # CLI tool
```

### Package Guidelines

When working on packages:

- **engine**: Core generation logic, no UI code
- **compiler**: Template rendering, file I/O
- **templates**: Static template definitions
- **backend**: API routes, workers, job queue
- **web**: UI components, routes, client logic

## 📝 Coding Standards

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Provide type annotations for public APIs
- Avoid `any` types

```typescript
// Good
function processProject(id: string): Promise<Project> {
  // ...
}

// Avoid
function processProject(id: any): any {
  // ...
}
```

### Code Style

We use ESLint and Prettier for code formatting:

```bash
# Check formatting
pnpm run lint

# Auto-fix issues
pnpm run lint:fix
```

### Naming Conventions

- **Files**: kebab-case (`intent-extractor.ts`)
- **Components**: PascalCase (`ProjectCard.tsx`)
- **Functions**: camelCase (`generateCode()`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRIES`)
- **Types/Interfaces**: PascalCase (`GenerationPlan`)

### Documentation

- Add JSDoc comments for public APIs
- Keep comments concise and meaningful
- Update README when adding new features

```typescript
/**
 * Extracts structured intent from a user prompt
 * 
 * @param prompt - The user's natural language prompt
 * @returns Extracted intent with features and constraints
 */
export async function extractIntent(
  prompt: UserPrompt
): Promise<ExtractedIntent> {
  // ...
}
```

## 🧪 Testing Guidelines

### Writing Tests

- Write tests for all new features
- Update tests when modifying code
- Aim for high test coverage
- Use descriptive test names

```typescript
import { describe, it, expect } from 'vitest';
import { extractIntent } from './intent-extractor';

describe('extractIntent', () => {
  it('should extract features from prompt', async () => {
    const prompt = {
      text: 'Build a todo app with auth',
      timestamp: new Date(),
    };
    
    const intent = await extractIntent(prompt);
    
    expect(intent.features).toContain('authentication');
  });
  
  it('should handle empty prompts', async () => {
    const prompt = { text: '', timestamp: new Date() };
    
    await expect(extractIntent(prompt)).rejects.toThrow();
  });
});
```

### Test Types

- **Unit tests**: Test individual functions/modules
- **Integration tests**: Test interaction between modules
- **E2E tests**: Test complete user flows (planned)

## 🔀 Pull Request Process

### Before Submitting

1. ✅ All tests pass (`pnpm run test`)
2. ✅ Code is linted (`pnpm run lint`)
3. ✅ Types check (`pnpm run typecheck`)
4. ✅ Commits follow conventional format
5. ✅ Documentation is updated
6. ✅ Branch is up-to-date with main

### Submitting a PR

1. Push your branch to your fork:

```bash
git push origin feature/your-feature-name
```

2. Open a Pull Request on GitHub
3. Fill out the PR template completely
4. Link any related issues
5. Request review from maintainers

### PR Title Format

Follow the same format as commits:

```
feat(engine): add support for custom templates
fix(backend): resolve worker timeout issue
docs(contributing): update testing guidelines
```

### PR Description Template

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes Made
- List key changes
- Add implementation details
- Mention any breaking changes

## Testing
- Describe how you tested the changes
- List any new test cases added

## Related Issues
Fixes #123
Relates to #456

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] All tests passing
- [ ] Code linted
- [ ] Types checked
```

### Review Process

- Maintainers will review your PR
- Address any feedback or requested changes
- Once approved, a maintainer will merge your PR
- Your contribution will be credited in release notes

## 🏗️ Working on Specific Areas

### Adding a New Feature to Engine

1. Create new file in `packages/engine/src/`
2. Export from `packages/engine/src/index.ts`
3. Add types to `packages/engine/src/types.ts`
4. Write tests in `*.test.ts` file
5. Update documentation

### Adding a New Template

1. Create directory in `packages/templates/src/`
2. Add `index.ts` with template definition
3. Export from `packages/templates/src/index.ts`
4. Add template metadata and files
5. Test template rendering

### Adding an API Endpoint

1. Add route in `services/backend/src/routes/`
2. Create controller in `services/backend/src/controllers/`
3. Add validation middleware if needed
4. Write integration tests
5. Update API documentation

### Improving the Frontend

1. Add components in `apps/web/app/components/`
2. Follow existing component patterns
3. Use TypeScript and proper types
4. Add Tailwind CSS for styling
5. Test in browser

## 💬 Community

### Getting Help

- **Discord**: Join our [Discord server](https://discord.gg/convex)
- **GitHub Discussions**: Ask questions in [Discussions](https://github.com/get-convex/chef/discussions)
- **Issues**: Search existing [issues](https://github.com/get-convex/chef/issues)

### Reporting Bugs

Use the bug report template when creating issues:

1. Describe the bug clearly
2. Provide steps to reproduce
3. Include error messages/screenshots
4. Specify your environment (OS, Node version, etc.)

### Suggesting Features

Use the feature request template:

1. Describe the feature and use case
2. Explain why it would be valuable
3. Provide examples or mockups if applicable

## 📚 Additional Resources

- [Architecture Guide](./ARCHITECTURE.md)
- [API Documentation](./docs/API.md)
- [Convex Documentation](https://docs.convex.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🎉 Recognition

Contributors are recognized in:
- Release notes
- Contributors page
- GitHub contributor graph

Thank you for contributing to Chef! 🙏

---

Questions? Reach out on [Discord](https://discord.gg/convex) or open a [Discussion](https://github.com/get-convex/chef/discussions).
