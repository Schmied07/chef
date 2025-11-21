# Security Policy

## Reporting a Vulnerability

We take the security of Chef seriously. If you discover a security vulnerability, please report it responsibly.

**Please DO NOT create public GitHub issues for security vulnerabilities.**

### How to Report

Email security concerns to: **security@convex.dev**

Please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Depends on severity (critical: 24-48h, high: 1 week, medium: 2 weeks, low: 1 month)

## Security Measures

### Input Validation & Sanitization

- **Zod Schemas**: All API inputs are validated using Zod schemas
- **Input Sanitization**: All strings are sanitized to prevent XSS
- **Path Traversal Protection**: File paths are normalized and validated
- **SQL Injection**: N/A (using MongoDB, not SQL)
- **NoSQL Injection**: Prevented via Zod validation and type safety

### Content Security Policy (CSP)

- **Strict CSP**: Enabled with nonce-based script execution
- **No Inline Scripts**: All scripts use nonce or external files
- **Frame Protection**: `X-Frame-Options: SAMEORIGIN`
- **XSS Protection**: `X-XSS-Protection: 1; mode=block`
- **MIME Sniffing**: `X-Content-Type-Options: nosniff`

### Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| Global API | 100 req | 15 min |
| /v1/generate | 5 req | 1 min |
| /v1/projects (POST) | 3 req | 1 min |
| Read-only | 200 req | 15 min |

### Authentication & Authorization

- **OAuth 2.0**: Used for user authentication
- **JWT Tokens**: Short-lived access tokens
- **API Keys**: Stored encrypted in environment variables
- **CORS**: Configured for allowed origins only

### Data Protection

- **Encryption in Transit**: HTTPS/TLS 1.2+ only
- **Encryption at Rest**: Sensitive data encrypted (API keys, secrets)
- **Secrets Management**: Environment variables, no hardcoded secrets
- **Docker Sandbox**: Isolated build environments with resource limits

### OWASP Top 10 Coverage

1. **A01:2021 - Broken Access Control**: ✅ Role-based access, JWT validation
2. **A02:2021 - Cryptographic Failures**: ✅ TLS 1.2+, encrypted secrets
3. **A03:2021 - Injection**: ✅ Input validation, sanitization, parameterized queries
4. **A04:2021 - Insecure Design**: ✅ Security by design, threat modeling
5. **A05:2021 - Security Misconfiguration**: ✅ Secure defaults, hardened headers
6. **A06:2021 - Vulnerable Components**: ✅ Regular audits, dependency scanning
7. **A07:2021 - Authentication Failures**: ✅ OAuth 2.0, secure sessions
8. **A08:2021 - Data Integrity Failures**: ✅ Input validation, integrity checks
9. **A09:2021 - Logging Failures**: ✅ Structured logging, audit trails
10. **A10:2021 - SSRF**: ✅ URL validation, no localhost access

### Security Scanning

- **npm audit**: Automated dependency vulnerability scanning
- **ESLint Security Plugin**: Static code analysis for security issues
- **Docker Image Scanning**: Base image vulnerability checks
- **Playwright Tests**: Automated security regression tests

### Secure Development Practices

1. **Code Review**: All changes reviewed before merge
2. **Least Privilege**: Services run with minimum required permissions
3. **Dependency Updates**: Regular updates and security patches
4. **Security Testing**: Unit, integration, and E2E security tests
5. **Monitoring**: Real-time alerting for security events

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
| < 0.1   | :x:                |

## Security Updates

Security updates are released as soon as possible after discovery. Users are notified via:
- GitHub Security Advisories
- Release notes
- Email notifications (for critical issues)

## Compliance

Chef follows industry best practices including:
- OWASP ASVS (Application Security Verification Standard)
- CWE/SANS Top 25 Most Dangerous Software Errors
- NIST Cybersecurity Framework

## Security Checklist for Contributors

Before submitting a PR, ensure:

- [ ] All inputs are validated with Zod schemas
- [ ] Strings are sanitized to prevent XSS
- [ ] No secrets or API keys in code
- [ ] Rate limiting applied to new endpoints
- [ ] Security headers configured
- [ ] Tests include security scenarios
- [ ] Dependencies are up to date
- [ ] No vulnerable packages (`npm audit`)
- [ ] Code passes ESLint security rules
- [ ] Documentation updated

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

## Contact

For security inquiries: security@convex.dev
For general support: support@convex.dev

---

**Last Updated**: 2025-08-01  
**Version**: 0.1.0
