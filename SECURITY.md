# Security Policy

## Reporting a vulnerability

Please do not open a public issue for suspected vulnerabilities.

Report privately through GitHub private vulnerability reporting when available, or contact the repository owner directly. Include the affected route, API, or deployment component, reproduction steps, expected impact, and any known mitigation.

Do not include live secrets, database dumps, session cookies, private keys, or user data in reports.

## Supported Scope

Security fixes are accepted for the current `main` branch.

The current baseline requires HTTPS, strict host allowlists, CSRF protection, Admin 2FA, Redis-backed rate limits in production, secret scanning, dependency audit, CodeQL, and Gitleaks.

## DDoS and Abuse Baseline

Large DDoS traffic must be handled by a CDN or WAF in front of the app. The application also keeps host allowlists, bot filtering, request budgets, API method guards, and emergency security modes to reduce abusive traffic without putting global friction in front of normal learners.

See [docs/security/SECURITY.md](docs/security/SECURITY.md) for the full policy and launch security checklist.
