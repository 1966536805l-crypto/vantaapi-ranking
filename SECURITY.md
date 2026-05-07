# Security Policy

## Supported scope

This repository is an MVP learning platform built with Next.js, Prisma, and MySQL/MariaDB.
Security fixes are accepted for the current `main` branch.

## Reporting a vulnerability

Do **not** open a public issue for a suspected vulnerability.

Report privately through GitHub private vulnerability reporting when available, or contact the repository owner directly.
Include:

- affected route, API, or deployment component
- reproduction steps
- expected impact
- whether credentials, admin access, or a special environment are required
- suggested mitigation if known

Please do not include live secrets, database dumps, student data, session cookies, or private keys in the report.

## Security baseline

The project aims to keep security high without breaking normal learner experience.

Required protections:

- HTTPS in production.
- Production host allowlist via `APP_ALLOWED_HOSTS`.
- Public registration disabled by default.
- Admin 2FA required by default.
- CSRF protection for unsafe write routes.
- Redis-backed rate limits enabled and fail-closed in production.
- C++ code execution disabled unless a separately isolated sandbox/worker is implemented.
- Database and Redis not exposed to the public internet.
- DDoS and heavy bot filtering handled at CDN/WAF level, not by global user-facing CAPTCHA.
- Edge abuse mode available through `SECURITY_MODE=normal|elevated|emergency`.

## DDoS and abuse mode

`SECURITY_MODE=normal` is designed to be invisible for real learners.

During active attacks, raise it without changing code:

- `elevated`: tighter page/API budgets while keeping public study pages usable.
- `emergency`: aggressive throttling for expensive APIs and suspicious traffic.

Large volumetric DDoS still requires a CDN/WAF in front of the app. The app layer blocks probes, abusive API patterns, oversized URLs, traversal/injection probes, and high-frequency per-IP traffic, but it should not be treated as a replacement for edge DDoS protection.

## CI gates

Pull requests and pushes should pass:

```bash
npm run security:regression
npm run security:check
npm run typecheck
npm run lint
npm run build
npm audit --audit-level=high
```

GitHub Actions also run CodeQL, dependency audit, and secret scanning.

## Out of scope for public testing

Without explicit written permission, do not perform:

- denial-of-service or stress testing
- social engineering
- phishing
- credential stuffing
- physical attacks
- attacks against third-party infrastructure
- destructive tests or data exfiltration

## Deployment security

See:

- `DEPLOYMENT.md`
- `docs/EDGE_SECURITY.md`

Important: application code cannot absorb large DDoS traffic alone. Use Cloudflare, Vercel Firewall, or an equivalent CDN/WAF in front of production.
