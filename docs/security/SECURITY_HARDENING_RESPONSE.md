# Security Hardening Response To External Review

Date: 2026-05-06
Scope: response to the 6/10 security review. No production deployment was performed.

## Review accepted

The review was directionally correct: the app had good MVP security awareness, but several items needed to be closed before public operation.

## High-priority fixes completed

### 1. Public default admin credentials removed

- Removed public default admin/student seed credentials from `prisma/seed.cjs`.
- Removed public default credentials from `README.md` and `DEVELOPMENT.md`.
- Seed no longer creates an admin unless explicit environment variables are provided:

```bash
SEED_ADMIN_EMAIL="admin@example.com" SEED_ADMIN_PASSWORD="strong-password" npm run db:seed
```

Demo users are opt-in only with `SEED_DEMO_USERS=true` and a strong `SEED_STUDENT_PASSWORD`.

### 2. First registered user no longer becomes ADMIN

- `/api/auth/register` now always creates public registrations as `USER`.
- Admin creation is handled through explicit seed/admin process, not through public registration.

### 3. AI coach is no longer anonymous

- `/api/ai/coach` now requires login via `requireUser`.
- Added per-user daily limit: 50 requests/day.
- Added optional Redis-backed distributed rate limit via `checkRedisRateLimit`.
- Local in-process limit remains as fallback for simple MVP deployments.

### 4. Redis is now lazy and optional

- `lib/redis.ts` no longer connects to Redis on import by default.
- Redis only activates when `REDIS_URL` exists or `ENABLE_REDIS_RATE_LIMITS=true`.
- This prevents noisy local errors while keeping production distributed limits ready.

### 5. Production Turnstile can fail closed

- `lib/turnstile.ts` now fails closed in production by default if Turnstile is required but not configured.
- Override is explicit: `AUTH_TURNSTILE_REQUIRED=false`.
- Scope remains low-friction: login/register only, not every page.

### 6. Security check script upgraded

`npm run security:check` now verifies:

- no public default admin seed remains
- AI coach requires login and per-user limits
- production Turnstile fail-closed behavior exists
- localhost-only dev/start scripts
- Postgres localhost-only Docker binding
- production host allowlist
- proxy cross-site/rate/body guards
- CSP/HSTS/frame/nosniff headers
- macOS firewall/stealth state
- LAN-facing listeners for manual review

## Verification

- `npm run security:check` ✅ 24 pass / 0 warn / 0 fail / 1 info
- Remaining info: LAN/all-interface listeners from non-vantaapi system/third-party apps require manual review.

Full build/test gate should be run after this file is written:

```bash
node --check prisma/seed.cjs
npm run typecheck
npm run lint
npm run build
npm audit --audit-level=high
```

## Still intentionally deferred

- Admin 2FA: useful before wide public admin use, but deferred to avoid adding daily friction before the admin flow stabilizes.
- Full CSRF token integration: current SameSite=strict + Origin/Referer/Sec-Fetch-Site guard remains; tokenized admin forms can be added in the next pass.
- Strict nonce/hash CSP: current CSP still allows inline styles/scripts needed by the current Next/Tailwind setup; tighten gradually.
- C++ runner remains disabled. Do not enable it without a real sandbox.
