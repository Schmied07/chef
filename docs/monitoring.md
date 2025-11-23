# Monitoring & Observability Guide

Chef includes comprehensive monitoring and observability through Sentry, Prometheus, Grafana, and PostHog.

## Table of Contents

1. [Overview](#overview)
2. [Sentry - Error Tracking](#sentry---error-tracking)
3. [Prometheus & Grafana - Metrics](#prometheus--grafana---metrics)
4. [PostHog - Analytics](#posthog---analytics)
5. [Structured Logging](#structured-logging)
6. [Quick Start](#quick-start)

---

## Overview

Chef's monitoring stack provides:

- **Error Tracking**: Real-time error monitoring and alerting (Sentry)
- **Metrics**: System and application metrics (Prometheus)
- **Visualization**: Custom dashboards (Grafana)
- **Analytics**: User behavior and feature usage (PostHog)
- **Logging**: Structured JSON logs with correlation IDs

---

## Sentry - Error Tracking

### Setup

1. **Create a Sentry Account**
   - Go to [sentry.io](https://sentry.io/) and create an account
   - Create a new project for your Chef instance

2. **Get Your DSN**
   - In your Sentry project settings, find your DSN
   - It looks like: `https://xxxxx@o000000.ingest.sentry.io/0000000`

3. **Configure Environment Variables**
   ```bash
   # Backend .env
   SENTRY_DSN=https://xxxxx@o000000.ingest.sentry.io/0000000
   SENTRY_ENV=production
   SENTRY_TRACES_SAMPLE_RATE=0.1  # Sample 10% of transactions
   SENTRY_PROFILES_SAMPLE_RATE=0.1  # Sample 10% for profiling
   ```

4. **Restart Backend**
   ```bash
   cd services/backend
   pnpm run dev
   ```

### Features

- **Error Tracking**: Automatic capture of all unhandled errors
- **Performance Monitoring**: Track API response times and slow queries
- **Breadcrumbs**: Detailed error context with user actions
- **Source Maps**: Ready for production (upload during release)
- **User Context**: Automatic user identification in errors
- **Request Context**: Full HTTP request details with sanitized sensitive data

### Verify Setup

Test Sentry integration:

```bash
curl -X GET http://localhost:3001/health
```

Check Sentry dashboard for incoming events.

---

## Prometheus & Grafana - Metrics

### Quick Start with Docker Compose

1. **Start Monitoring Stack**
   ```bash
   cd /app/infra
   docker-compose -f docker-compose.monitoring.yml up -d
   ```

2. **Access Services**
   - Prometheus: http://localhost:9090
   - Grafana: http://localhost:3000 (admin/admin)

3. **View Metrics**
   - Backend exposes metrics at: http://localhost:3001/metrics/prometheus

### Available Metrics

#### HTTP Metrics
- `chef_http_request_duration_seconds` - Request latency histogram
- `chef_http_requests_total` - Total request counter
- `chef_http_requests_active` - Active requests gauge

#### Build Metrics
- `chef_build_duration_seconds` - Build job duration histogram
- `chef_builds_total` - Total builds counter

#### Queue Metrics
- `chef_queue_size` - Jobs in queue by status
- `chef_queue_jobs_active` - Active jobs being processed
- `chef_queue_job_duration_seconds` - Queue job duration

#### Error Metrics
- `chef_errors_total` - Total errors by type and severity

#### System Metrics
- `chef_websocket_connections` - Active WebSocket connections
- `chef_docker_containers` - Docker container counts
- `process_cpu_user_seconds_total` - CPU usage
- `process_resident_memory_bytes` - Memory usage
- `nodejs_eventloop_lag_seconds` - Event loop lag

### Grafana Dashboards

#### Default Dashboards

1. **HTTP Performance Dashboard**
   - Request rates and latency
   - Error rates
   - Status code distribution

2. **Build Pipeline Dashboard**
   - Build durations
   - Success/failure rates
   - Queue sizes

3. **System Resources Dashboard**
   - CPU and memory usage
   - Event loop health
   - Docker container status

### Custom Queries

Example Prometheus queries:

```promql
# Average request duration (last 5 minutes)
rate(chef_http_request_duration_seconds_sum[5m]) / 
rate(chef_http_request_duration_seconds_count[5m])

# Error rate percentage
(rate(chef_http_requests_total{status_code=~"5.."}[5m]) / 
rate(chef_http_requests_total[5m])) * 100

# Builds per minute
rate(chef_builds_total[1m]) * 60
```

---

## PostHog - Analytics

### Self-Hosted Setup

PostHog is included in the monitoring Docker Compose stack:

```bash
cd /app/infra
docker-compose -f docker-compose.monitoring.yml up -d
```

Access PostHog at: http://localhost:8000

### Configuration

```bash
# Backend .env
ENABLE_ANALYTICS=true
POSTHOG_API_KEY=your-project-api-key
POSTHOG_HOST=http://localhost:8000  # Or https://app.posthog.com for cloud
```

### Tracked Events

#### Backend Events
- `template_selected` - User selects a template
- `build_started` - Build job starts
- `build_completed` - Build job finishes (with success/failure)
- `preview_opened` - User opens preview
- `error_occurred` - Error happens

#### Event Properties
- `template` - Template name
- `projectId` - Project identifier
- `duration_ms` - Operation duration
- `success` - Success/failure boolean
- `error_type` - Error category

### Privacy

- Analytics are **opt-in** (disabled by default)
- Set `ENABLE_ANALYTICS=true` to enable
- No personally identifiable information (PII) is tracked
- User IDs are anonymized hashes

---

## Structured Logging

### Log Levels

Chef uses 4 log levels (configurable via `LOG_LEVEL` env var):

1. **debug** - Detailed debugging information
2. **info** - General informational messages
3. **warn** - Warning messages
4. **error** - Error messages

### Log Format

#### Development
Human-readable format:
```
[INFO] 2025-08-15T10:30:00.000Z - Server started {"port":3001}
```

#### Production
JSON format for log aggregation:
```json
{
  "level": "info",
  "timestamp": "2025-08-15T10:30:00.000Z",
  "message": "Server started",
  "port": 3001,
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Correlation IDs

Every request gets a unique `requestId` for tracing:

```
X-Request-ID: 550e8400-e29b-41d4-a716-446655440000
```

This ID is:
- Included in all log entries for that request
- Returned in response headers
- Sent to Sentry for error correlation
- Used in metrics tags

### Log Enrichment

Logs automatically include:
- `requestId` - Request correlation ID
- `userId` - User identifier (when available)
- `projectId` - Project identifier (when available)
- `jobId` - Job identifier (when available)
- `method` - HTTP method
- `path` - Request path
- `ip` - Client IP address

### ELK Stack Integration (Optional)

For centralized logging, Chef logs are ready to be shipped to ELK stack:

1. **Install Filebeat** on your server
2. **Configure Filebeat** to read logs:
   ```yaml
   filebeat.inputs:
   - type: log
     enabled: true
     paths:
       - /var/log/chef-backend/*.log
     json.keys_under_root: true
   ```
3. **Ship to Logstash or Elasticsearch**

---

## Quick Start

### Minimal Setup (Sentry Only)

```bash
# 1. Get Sentry DSN from sentry.io
# 2. Add to .env
echo "SENTRY_DSN=https://xxxxx@sentry.io/xxxxx" >> services/backend/.env

# 3. Restart backend
cd services/backend
pnpm run dev
```

### Full Stack Setup

```bash
# 1. Start monitoring services
cd /app/infra
docker-compose -f docker-compose.monitoring.yml up -d

# 2. Configure backend
cat >> services/backend/.env << EOF
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
ENABLE_ANALYTICS=true
POSTHOG_API_KEY=your-api-key
POSTHOG_HOST=http://localhost:8000
LOG_LEVEL=info
EOF

# 3. Restart backend
cd ../services/backend
pnpm run dev

# 4. Access dashboards
# - Grafana: http://localhost:3000 (admin/admin)
# - Prometheus: http://localhost:9090
# - PostHog: http://localhost:8000
```

### Verify Setup

```bash
# Check health
curl http://localhost:3001/health

# Check metrics
curl http://localhost:3001/metrics/prometheus

# Check JSON metrics
curl http://localhost:3001/metrics
```

---

## Troubleshooting

### Sentry Not Capturing Errors

1. Verify DSN is set:
   ```bash
   env | grep SENTRY_DSN
   ```

2. Check Sentry initialization logs:
   ```
   ✅ Sentry initialized successfully
   ```

3. Test error capture:
   ```bash
   curl -X GET http://localhost:3001/test-error
   ```

### Prometheus Not Scraping

1. Check Prometheus targets:
   - Go to http://localhost:9090/targets
   - Verify `chef-backend` is UP

2. Test metrics endpoint:
   ```bash
   curl http://localhost:3001/metrics/prometheus
   ```

3. Check Docker networking:
   ```bash
   docker network inspect infra_monitoring
   ```

### PostHog Not Tracking

1. Verify analytics is enabled:
   ```bash
   env | grep ENABLE_ANALYTICS
   ```

2. Check PostHog logs:
   ```bash
   docker logs chef-posthog
   ```

3. Verify API key:
   ```bash
   env | grep POSTHOG_API_KEY
   ```

---

## Best Practices

1. **Set Appropriate Sample Rates**
   - Production: 0.1 (10%) for traces
   - Development: 1.0 (100%) for debugging

2. **Monitor Your Monitors**
   - Set up alerts in Grafana
   - Configure Sentry alert rules
   - Monitor Prometheus storage usage

3. **Log Retention**
   - Rotate logs daily
   - Keep logs for 30 days
   - Archive to S3 for compliance

4. **Privacy**
   - Sanitize sensitive data in logs
   - Use opt-in analytics
   - Anonymize user identifiers

5. **Performance**
   - Use async logging
   - Buffer metrics updates
   - Sample high-frequency events

---

## Further Reading

- [Sentry Documentation](https://docs.sentry.io/)
- [Prometheus Best Practices](https://prometheus.io/docs/practices/)
- [Grafana Tutorials](https://grafana.com/tutorials/)
- [PostHog Documentation](https://posthog.com/docs)
