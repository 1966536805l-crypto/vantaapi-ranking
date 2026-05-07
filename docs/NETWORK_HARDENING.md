# Network Hardening Baseline

This baseline strengthens production networking without breaking normal learners.

## Security modes

The app supports a low-friction runtime switch:

```env
SECURITY_MODE="normal"     # default, best user experience
SECURITY_MODE="elevated"   # active abuse: tighter budgets
SECURITY_MODE="emergency"  # active attack: aggressive throttling
```

Use `normal` for daily traffic. Raise to `elevated` during suspicious spikes. Use `emergency` only during attacks because it can throttle heavy learners and expensive endpoints faster.

## Layered protection

1. **CDN/WAF layer:** absorbs DDoS and known bad traffic before origin.
2. **Origin firewall:** exposes only 80/443 through CDN/WAF, never internal ports.
3. **Reverse proxy:** small request/body limits, rate limiting, hidden file blocks.
4. **Next.js proxy:** host guard, method guard, fetch metadata checks, bot scoring, API budgets.
5. **Route guards:** auth, CSRF, admin 2FA, Redis fail-closed rate limits.

## Origin exposure rules

Required:

- Public inbound: `80/tcp`, `443/tcp` only.
- If behind Cloudflare/self-hosted CDN: allow `80/443` only from CDN IP ranges.
- Do not expose: `3000`, `3306`, Redis, Prisma Studio, PM2 dashboard, SSH password login.
- Database and Redis bind to loopback/private network.
- SSH only from trusted admin IP or tailnet if needed.

## Reverse proxy defaults

Use `deploy/nginx/vantaapi-security.conf` as the starting template. It includes:

- request rate zones for pages, APIs, auth, admin, and AI
- body size caps
- hidden-file/probe blocks
- strict proxy headers
- cache-safe static asset handling
- no public access to local artifacts

## App-layer network defenses

The Next.js proxy blocks or throttles:

- invalid host headers
- unsupported HTTP methods
- cross-site unsafe API requests
- oversized request bodies
- sensitive probes such as `/.env`, `/.git`, `wp-login.php`, `xmlrpc.php`, `phpmyadmin`
- traversal probes such as `../`, encoded traversal, null bytes, backslashes
- basic injection probes in URL/search strings
- excessive global, page, API, and expensive endpoint bursts

Expensive endpoints have stricter budgets:

- `/api/ai/coach`
- `/api/auth/login`
- `/api/auth/register`
- `/api/quiz/submit`
- `/api/cpp/run` — C++ runner still defaults off

## User experience guardrail

Do not globally challenge every visitor. Normal learning pages should remain usable. Apply tighter controls to:

- login/register
- admin
- AI endpoints
- write APIs
- malicious probes
- traffic with automation signals

## Verification commands

```bash
npm run security:network
npm run security:check
npm run security:regression
npm run typecheck
npm run lint
npm run build
```

External checks after deployment:

- Confirm `https://securityheaders.com` is clean.
- Confirm origin does not expose `3000`, `3306`, Redis, Prisma Studio, or PM2 dashboard.
- Confirm WAF/CDN analytics show blocked probes without high false positives.
- Confirm normal learners can still browse lessons, submit quizzes, track progress, and log in.
