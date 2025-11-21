# Testing Guide

This document describes the testing strategy and how to run tests for Chef Backend.

## Test Pyramid

```
        /\
       /E2E\        ← End-to-End (Playwright)
      /------\
     /  INT   \     ← Integration (Supertest)
    /----------\
   /    UNIT    \   ← Unit (Vitest)
  /--------------\
```

## Test Structure

```
src/__tests__/
├── unit/              # Unit tests
│   ├── validation.test.ts
│   ├── sanitizer.test.ts
│   ├── env.test.ts
│   └── ...
├── integration/       # Integration tests
│   ├── api.test.ts
│   ├── security.test.ts
│   └── ...
└── e2e/               # End-to-end tests
    ├── api-endpoints.spec.ts
    ├── security.spec.ts
    └── rate-limiting.spec.ts
```

## Running Tests

### All Tests

```bash
npm run test
```

### Unit Tests Only

```bash
npm run test:unit
```

### Integration Tests Only

```bash
npm run test:integration
```

### E2E Tests Only

```bash
npm run test:e2e
```

### Watch Mode

```bash
npm run test:watch
```

### Coverage Report

```bash
npm run test:coverage
```

Target: **80% code coverage**

## Unit Tests

Unit tests focus on individual functions and modules in isolation.

**Technologies:**
- Vitest
- Mocking with `vi`

**What we test:**
- Middleware functions (validation, sanitization)
- Utility functions
- Configuration loading
- Schema validation

**Example:**

```typescript
import { describe, it, expect, vi } from 'vitest';
import { validateBody } from '../../middleware/validation';

describe('Validation Middleware', () => {
  it('should validate valid data', async () => {
    // Test implementation
  });
});
```

## Integration Tests

Integration tests verify multiple components working together.

**Technologies:**
- Vitest
- Supertest (HTTP testing)

**What we test:**
- API endpoints
- Middleware chains
- Request/response flow
- Error handling
- Security features

**Example:**

```typescript
import request from 'supertest';
import app from '../../app';

describe('POST /v1/projects', () => {
  it('should create project', async () => {
    const response = await request(app)
      .post('/v1/projects')
      .send(validData)
      .expect(201);
  });
});
```

## E2E Tests

End-to-end tests simulate real user scenarios.

**Technologies:**
- Playwright

**What we test:**
- Complete user workflows
- Security scenarios
- Rate limiting behavior
- Error handling
- Real API responses

**Example:**

```typescript
import { test, expect } from '@playwright/test';

test('should create and retrieve project', async ({ request }) => {
  const createResponse = await request.post('/v1/projects', {
    data: projectData,
  });
  expect(createResponse.ok()).toBeTruthy();
});
```

## Security Testing

All test levels include security scenarios:

### Unit Level
- Input sanitization
- Path traversal prevention
- XSS protection

### Integration Level
- API security headers
- CORS policies
- Authentication/Authorization

### E2E Level
- Complete attack scenarios
- Rate limiting
- CSP enforcement

## Test Coverage

### Current Coverage

Run `npm run test:coverage` to see detailed coverage report.

**Targets:**
- Overall: 80%+
- Critical paths: 90%+
- Security code: 95%+

### Coverage by Module

```
src/
├── middleware/     → 95%+ (critical)
├── controllers/    → 85%+
├── services/       → 80%+
├── utils/          → 80%+
└── config/         → 90%+ (critical)
```

## Continuous Integration

### GitHub Actions Workflow

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:coverage
      - run: npm audit
```

### Pre-commit Checks

```bash
# Run before committing
npm run typecheck
npm run lint
npm run test
npm run audit
```

## Test Data

### Test Fixtures

Located in `src/__tests__/fixtures/`:

```typescript
// valid-project.json
{
  "files": [
    {
      "path": "src/index.ts",
      "content": "console.log('Hello');"
    }
  ]
}
```

### Mocking

Use Vitest's `vi.mock()` for external dependencies:

```typescript
vi.mock('../../services/redis', () => ({
  getRedisClient: vi.fn(),
  checkRedisHealth: vi.fn().mockResolvedValue(true),
}));
```

## Writing New Tests

### Checklist

- [ ] Test file named `*.test.ts` (unit/int) or `*.spec.ts` (e2e)
- [ ] Clear test descriptions
- [ ] Arrange-Act-Assert pattern
- [ ] Clean up resources (afterEach)
- [ ] Mock external dependencies
- [ ] Test error cases
- [ ] Include security scenarios
- [ ] Update this documentation

### Test Template

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Feature Name', () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  it('should do something', () => {
    // Arrange
    const input = 'test';

    // Act
    const result = functionUnderTest(input);

    // Assert
    expect(result).toBe('expected');
  });

  it('should handle errors', () => {
    expect(() => functionUnderTest(null)).toThrow();
  });
});
```

## Debugging Tests

### Run Single Test

```bash
# Unit/Integration
npm run test -- validation.test.ts

# E2E
npm run test:e2e -- security.spec.ts
```

### Debug Mode

```bash
# Unit/Integration
npm run test:watch

# E2E with UI
npx playwright test --ui
```

### View Test Reports

```bash
# Unit/Integration coverage
open coverage/index.html

# E2E report
npx playwright show-report
```

## Performance Testing

Performance tests ensure the API meets SLA requirements.

**Metrics:**
- Response time < 200ms (p95)
- Throughput > 100 req/s
- Error rate < 0.1%

**Tools:**
- Artillery
- k6
- Apache Bench

## Load Testing

```bash
# Install Artillery
npm install -g artillery

# Run load test
artillery run load-test.yml
```

## Best Practices

1. **Test Isolation**: Each test should be independent
2. **Clear Names**: Test names describe what is being tested
3. **Fast Tests**: Unit tests should run in < 1s
4. **Deterministic**: Tests should not be flaky
5. **Coverage**: Aim for 80%+ overall, 95%+ for critical paths
6. **Security Focus**: Always test security scenarios
7. **Mock External**: Mock Redis, Docker, external APIs
8. **Clean State**: Reset state between tests

## Troubleshooting

### Tests Fail Locally

1. Check environment variables (.env)
2. Ensure Redis is running (if needed)
3. Check port 3001 is available
4. Clear node_modules and reinstall

### Tests Pass Locally, Fail in CI

1. Check CI environment variables
2. Verify service dependencies
3. Check for timing issues
4. Review CI logs

### Flaky Tests

1. Add explicit waits
2. Check for race conditions
3. Mock time-dependent code
4. Increase timeouts

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://testingjavascript.com/)

---

**Questions?** Contact the backend team or open an issue.
