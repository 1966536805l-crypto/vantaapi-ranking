# Security Policy

## Supported scope

This repository is a focused GitHub launch audit and AI developer tools platform built with Next.js, Prisma, and Postgres.
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
- Supply-chain gates for dependency audit, lockfile hygiene, CodeQL, Gitleaks, and local secret pattern checks.

## DDoS and abuse mode

`SECURITY_MODE=normal` is designed to be invisible for real learners.

During active attacks, raise it without changing code:

- `elevated`: tighter page/API budgets while keeping public study pages usable.
- `emergency`: aggressive throttling for expensive APIs and suspicious traffic.

Large volumetric DDoS still requires a CDN/WAF in front of the app. The app layer blocks probes, abusive API patterns, oversized URLs, traversal/injection probes, and high-frequency per-IP traffic, but it should not be treated as a replacement for edge DDoS protection.

Additional app-layer defenses:

- Per-IP global request budgets.
- Per-fingerprint read/write budgets for distributed low-quality traffic.
- Tighter budgets for expensive endpoints such as AI coach, login, registration, quiz submit and code execution.
- JSON-only enforcement for JSON write APIs.
- Smaller request body limits for AI/auth endpoints.
- Query-shape limits for parameter floods and open-redirect probes.
- Emergency mode write protection for non-core APIs.
- Blocking for cloud metadata, double-encoded traversal and common injection probes.
- Short-lived penalty box for repeat offenders after rate-limit, trap or bot-rule hits.
- Early API method allowlists for high-risk endpoints.
- Early authentication-cookie check for admin APIs before route code runs.

## CI gates

Pull requests and pushes should pass:

```bash
npm run security:regression
npm run security:check
npm run security:repo
npm run security:network
npm run security:supply-chain
npm run security:secrets
npm run typecheck
npm run lint
npm run build
npm run language:smoke -- --base=http://127.0.0.1:3003
npm audit --audit-level=high
```

GitHub Actions also run CodeQL, dependency audit, secret scanning, production build, and multilingual smoke checks.

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
- `docs/NETWORK_HARDENING.md`
- `docs/SUPPLY_CHAIN_SECURITY.md`

Important: application code cannot absorb large DDoS traffic alone. Use Cloudflare, Vercel Firewall, or an equivalent CDN/WAF in front of production.
