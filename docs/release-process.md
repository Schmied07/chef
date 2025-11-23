# Release Process

Chef follows semantic versioning and uses automated release workflows.

## Table of Contents

1. [Versioning Strategy](#versioning-strategy)
2. [Release Workflow](#release-workflow)
3. [Automated Releases](#automated-releases)
4. [Manual Releases](#manual-releases)
5. [Hotfix Process](#hotfix-process)
6. [Rollback Procedures](#rollback-procedures)
7. [Migration Guides](#migration-guides)

---

## Versioning Strategy

Chef uses [Semantic Versioning 2.0.0](https://semver.org/):

```
MAJOR.MINOR.PATCH
```

### Version Increments

- **MAJOR** (1.0.0 → 2.0.0): Breaking changes
  - API changes that break backward compatibility
  - Database schema changes requiring migration
  - Removal of deprecated features

- **MINOR** (1.0.0 → 1.1.0): New features (backward compatible)
  - New API endpoints
  - New features
  - Deprecation warnings (but not removal)

- **PATCH** (1.0.0 → 1.0.1): Bug fixes
  - Bug fixes
  - Security patches
  - Performance improvements

### Pre-release Tags

- **alpha**: Early testing (0.1.0-alpha.1)
- **beta**: Feature complete, testing (1.0.0-beta.1)
- **rc**: Release candidate (1.0.0-rc.1)

---

## Release Workflow

### 1. Development

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/my-feature
```

### 2. Code Review

- All PRs require at least one approval
- CI must pass (tests, linting, type checking)
- Code coverage must not decrease

### 3. Merge to Main

```bash
# Squash and merge PR
git checkout main
git pull origin main
```

### 4. Automated Release

Release is triggered automatically on main branch:

1. CI runs all tests
2. Version is bumped based on commit messages
3. Changelog is generated
4. Git tag is created
5. Release notes are published
6. Source maps are uploaded to Sentry

---

## Automated Releases

### Commit Message Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

#### Types

- `feat`: New feature (MINOR bump)
- `fix`: Bug fix (PATCH bump)
- `docs`: Documentation changes (no bump)
- `style`: Code style changes (no bump)
- `refactor`: Code refactoring (no bump)
- `perf`: Performance improvement (PATCH bump)
- `test`: Test changes (no bump)
- `chore`: Build/tooling changes (no bump)
- `BREAKING CHANGE`: Breaking change (MAJOR bump)

#### Examples

```bash
# Feature (minor bump)
git commit -m "feat(api): add project export endpoint"

# Bug fix (patch bump)
git commit -m "fix(auth): resolve token expiration issue"

# Breaking change (major bump)
git commit -m "feat(api)!: redesign authentication flow

BREAKING CHANGE: API endpoints now require Bearer token instead of API key"
```

### GitHub Actions Workflow

See `.github/workflows/release.yml` for the automated release pipeline.

---

## Manual Releases

### Prerequisites

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Build project
pnpm build
```

### Release Steps

1. **Update Version**
   ```bash
   # Update package.json versions
   pnpm version patch  # or minor, major
   ```

2. **Update Changelog**
   ```bash
   # Edit CHANGELOG.md manually
   vim CHANGELOG.md
   ```

3. **Create Git Tag**
   ```bash
   git tag -a v1.2.3 -m "Release v1.2.3"
   git push origin v1.2.3
   ```

4. **Publish Release**
   - Go to GitHub Releases
   - Click "Create a new release"
   - Select tag v1.2.3
   - Add release notes
   - Publish release

5. **Upload Source Maps to Sentry**
   ```bash
   export SENTRY_AUTH_TOKEN=your-token
   export SENTRY_ORG=your-org
   export SENTRY_PROJECT=your-project
   
   # Backend
   cd services/backend
   sentry-cli releases new v1.2.3
   sentry-cli releases files v1.2.3 upload-sourcemaps ./dist
   sentry-cli releases finalize v1.2.3
   
   # Frontend (if applicable)
   cd ../../app
   sentry-cli releases new v1.2.3
   sentry-cli releases files v1.2.3 upload-sourcemaps ./build
   sentry-cli releases finalize v1.2.3
   ```

---

## Hotfix Process

### When to Use Hotfix

- Critical production bug
- Security vulnerability
- Data loss issue

### Hotfix Workflow

1. **Create Hotfix Branch**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b hotfix/critical-bug-fix
   ```

2. **Make Fix**
   ```bash
   # Fix the issue
   vim services/backend/src/problematic-file.ts
   
   # Test thoroughly
   pnpm test
   
   # Commit with fix type
   git commit -m "fix(critical): resolve data loss in export"
   ```

3. **Fast-Track Review**
   - Create PR with "HOTFIX" label
   - Require only one approval
   - Expedite CI checks

4. **Release Immediately**
   ```bash
   # Merge to main
   git checkout main
   git merge hotfix/critical-bug-fix
   
   # Tag and push
   git tag -a v1.2.4 -m "Hotfix: critical bug"
   git push origin main --tags
   ```

5. **Deploy**
   - Trigger deployment manually if needed
   - Monitor closely

6. **Communicate**
   - Notify users via changelog
   - Update status page
   - Send email if critical

---

## Rollback Procedures

### Quick Rollback (< 1 hour old)

```bash
# 1. Revert to previous version
git revert HEAD
git push origin main

# 2. Redeploy
# (Deployment depends on your infrastructure)
```

### Full Rollback (> 1 hour old)

1. **Identify Last Good Version**
   ```bash
   git log --oneline
   git tag
   ```

2. **Create Rollback Branch**
   ```bash
   git checkout v1.2.2  # Last good version
   git checkout -b rollback/v1.2.2
   ```

3. **Deploy Rollback**
   ```bash
   # Merge to main
   git checkout main
   git merge rollback/v1.2.2
   git push origin main
   ```

4. **Tag Rollback**
   ```bash
   git tag -a v1.2.5 -m "Rollback to v1.2.2"
   git push origin v1.2.5
   ```

### Database Rollback

For database migrations:

```bash
# Backend database rollback
cd services/backend
pnpm run migrate:rollback
```

### Verify Rollback

```bash
# Check health
curl http://your-api/health

# Check Sentry for errors
# Check Grafana metrics
# Check user reports
```

---

## Migration Guides

### Creating Migration Guides

For MAJOR version bumps, create a migration guide:

```markdown
# Migration Guide: v1.x to v2.0

## Breaking Changes

### API Changes

**Before (v1.x):**
```javascript
fetch('/api/projects', {
  headers: { 'X-API-Key': 'key' }
})
```

**After (v2.0):**
```javascript
fetch('/api/projects', {
  headers: { 'Authorization': 'Bearer token' }
})
```

### Database Changes

Run migration:
```bash
pnpm run migrate
```

### Configuration Changes

Update `.env`:
```
- API_KEY=xxx
+ BEARER_TOKEN=xxx
```
```

### Migration Checklist Template

```markdown
## Migration Checklist

- [ ] Backup database
- [ ] Update environment variables
- [ ] Run migrations
- [ ] Update client code
- [ ] Test in staging
- [ ] Deploy to production
- [ ] Monitor for issues
- [ ] Update documentation
```

---
## Release Checklist

### Pre-Release

- [ ] All tests passing
- [ ] Code coverage >= 80%
- [ ] Documentation updated
- [ ] Changelog updated
- [ ] Migration guide created (if MAJOR)
- [ ] Staging deployment tested
- [ ] Performance benchmarks run
- [ ] Security scan passed

### Release

- [ ] Version bumped
- [ ] Git tag created
- [ ] Release notes published
- [ ] Source maps uploaded to Sentry
- [ ] Docker images built
- [ ] Deployment triggered

### Post-Release

- [ ] Production deployment verified
- [ ] Health checks passing
- [ ] Monitoring dashboards reviewed
- [ ] No critical errors in Sentry
- [ ] Performance metrics stable
- [ ] User communication sent
- [ ] Release announced

---

## Changelog Format

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2025-08-15

### Added
- New project export feature
- Real-time collaboration support

### Changed
- Improved build performance by 40%
- Updated dependency versions

### Deprecated
- Legacy API endpoints (will be removed in 2.0)

### Removed
- Old authentication flow

### Fixed
- Export crash on large projects
- Memory leak in websocket handler

### Security
- Patched XSS vulnerability in preview
```

---

## Further Reading

- [Semantic Versioning](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github)
