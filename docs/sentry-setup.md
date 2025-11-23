# Sentry Setup Guide

Detailed guide for setting up Sentry error tracking with Chef.

## Quick Setup

### 1. Create Sentry Account

1. Go to [sentry.io](https://sentry.io/)
2. Sign up for free account
3. Create a new organization (e.g., "My Company")

### 2. Create Projects

Create separate projects for backend and frontend:

#### Backend Project
1. Click "Create Project"
2. Platform: **Node.js**
3. Project name: `chef-backend`
4. Copy the DSN

#### Frontend Project (Optional)
1. Click "Create Project"
2. Platform: **Remix** or **React**
3. Project name: `chef-frontend`
4. Copy the DSN

### 3. Configure Backend

Add to `/app/services/backend/.env`:

```bash
SENTRY_DSN=https://xxxxx@o000000.ingest.sentry.io/0000000
SENTRY_ENV=production
SENTRY_TRACES_SAMPLE_RATE=0.1
SENTRY_PROFILES_SAMPLE_RATE=0.1
```

### 4. Restart Services

```bash
cd /app/services/backend
pnpm run dev
```

You should see:
```
✅ Sentry initialized successfully
```

---

## Environment Variables

### Required

- `SENTRY_DSN` - Your Sentry DSN (Data Source Name)
  - Format: `https://[key]@[org].ingest.sentry.io/[project]`
  - Get from: Sentry Project Settings → Client Keys (DSN)

### Optional

- `SENTRY_ENV` - Environment name (default: NODE_ENV)
  - Values: `development`, `staging`, `production`
  - Used to filter issues by environment

- `SENTRY_TRACES_SAMPLE_RATE` - Performance monitoring sample rate
  - Range: 0.0 to 1.0
  - Default: 0.1 (10% of transactions)
  - Recommendation: 0.1 for production, 1.0 for development

- `SENTRY_PROFILES_SAMPLE_RATE` - Profiling sample rate
  - Range: 0.0 to 1.0
  - Default: 0.1 (10% of transactions)
  - Requires Sentry Performance plan

- `SENTRY_RELEASE` - Release version
  - Format: `backend@1.2.3` or Git SHA
  - Auto-set in CI/CD pipeline
  - Used for source map matching

---

## Features

### Error Tracking

Automatically captures:
- Unhandled exceptions
- Unhandled promise rejections
- HTTP errors (4xx, 5xx)
- Custom errors

### Performance Monitoring

Tracks:
- HTTP request duration
- Database query performance
- External API calls
- Custom transactions

### Breadcrumbs

Records:
- HTTP requests
- Database queries
- Console logs
- User actions

### Context

Includes:
- Request ID (correlation)
- User information
- HTTP request details
- Environment data

### Data Sanitization

Automatically redacts:
- Authorization headers
- Cookies
- API keys
- Passwords

---

## Source Maps

### Why Source Maps?

Source maps allow Sentry to show original TypeScript code in stack traces instead of compiled JavaScript.

### Upload Source Maps

#### During Release (Automated)

GitHub Actions automatically uploads source maps:

```yaml
# .github/workflows/release.yml
- name: Upload Source Maps to Sentry
  env:
    SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
  run: |
    npm install -g @sentry/cli
    sentry-cli releases new ${{ github.ref_name }}
    sentry-cli releases files ${{ github.ref_name }} upload-sourcemaps ./dist
    sentry-cli releases finalize ${{ github.ref_name }}
```

#### Manual Upload

```bash
# Install Sentry CLI
npm install -g @sentry/cli

# Configure
export SENTRY_AUTH_TOKEN=your-auth-token
export SENTRY_ORG=your-org
export SENTRY_PROJECT=chef-backend

# Upload
cd services/backend
pnpm build
sentry-cli releases new v1.2.3
sentry-cli releases files v1.2.3 upload-sourcemaps ./dist --rewrite
sentry-cli releases finalize v1.2.3
```

### Create Auth Token

1. Go to Sentry Settings → Auth Tokens
2. Create new token with scopes:
   - `project:read`
   - `project:releases`
   - `org:read`
3. Save token securely

---

## Alerts

### Configure Alerts

1. Go to Sentry Project → Alerts
2. Create new alert rule:
   - **Trigger**: Errors > 10 in 1 minute
   - **Actions**: Send email, Slack notification
   - **Environment**: Production only

### Recommended Alerts

1. **High Error Rate**
   - Condition: Errors > 100 in 5 minutes
   - Action: Page on-call engineer

2. **Critical Error**
   - Condition: Any error with "critical" tag
   - Action: Immediate notification

3. **Performance Degradation**
   - Condition: P95 latency > 5 seconds
   - Action: Send Slack message

---

## Best Practices

### 1. Use Environments

Separate issues by environment:

```bash
# Development
SENTRY_ENV=development

# Staging
SENTRY_ENV=staging

# Production
SENTRY_ENV=production
```

### 2. Set Sample Rates

Balance monitoring with cost:

```bash
# Production
SENTRY_TRACES_SAMPLE_RATE=0.1  # 10%

# Staging
SENTRY_TRACES_SAMPLE_RATE=0.5  # 50%

# Development
SENTRY_TRACES_SAMPLE_RATE=1.0  # 100%
```

### 3. Use Release Tracking

Track issues by release:

```bash
SENTRY_RELEASE=$(git rev-parse --short HEAD)
```

### 4. Add User Context

Identify users in errors:

```typescript
import { setUser } from './monitoring/sentry';

setUser({
  id: user.id,
  email: user.email,
  username: user.username,
});
```

### 5. Use Custom Tags

Filter and search issues:

```typescript
import { setContext } from './monitoring/sentry';

setContext('project', {
  id: project.id,
  template: project.template,
});
```

---

## Troubleshooting

### Sentry Not Capturing Errors

1. **Check DSN**
   ```bash
   echo $SENTRY_DSN
   ```

2. **Verify Initialization**
   Look for log:
   ```
   ✅ Sentry initialized successfully
   ```

3. **Test Error Capture**
   ```typescript
   import { captureException } from './monitoring/sentry';
   captureException(new Error('Test error'));
   ```

4. **Check Network**
   Verify firewall allows traffic to `*.ingest.sentry.io`

### Source Maps Not Working

1. **Verify Upload**
   ```bash
   sentry-cli releases files v1.2.3 list
   ```

2. **Check Release**
   Ensure `SENTRY_RELEASE` matches uploaded version

3. **Verify Rewrite**
   Use `--rewrite` flag:
   ```bash
   sentry-cli releases files v1.2.3 upload-sourcemaps ./dist --rewrite
   ```

### High Event Volume

1. **Increase Sample Rate Gradually**
   Start at 0.01 (1%), increase if needed

2. **Filter Noisy Errors**
   Add to `beforeSend` hook:
   ```typescript
   beforeSend(event) {
     if (event.exception?.values?.[0]?.type === 'TimeoutError') {
       return null;  // Ignore timeout errors
     }
     return event;
   }
   ```

3. **Use Inbound Filters**
   Sentry Settings → Inbound Filters → Add filter

---

## Further Reading

- [Sentry Node.js Documentation](https://docs.sentry.io/platforms/node/)
- [Sentry Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Sentry Release Management](https://docs.sentry.io/product/releases/)
- [Sentry CLI Reference](https://docs.sentry.io/cli/)
