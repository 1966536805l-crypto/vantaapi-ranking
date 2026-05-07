# Enterprise Security Hardening Report

Date: 2026-05-06
Scope: `vantaapi-ranking` Next.js learning-site MVP, code-side hardening only. No production deployment was performed.

## Baseline stance

This pass moves the app from MVP security toward an enterprise baseline. “Enterprise-grade” still requires production operations controls outside code: managed secrets, centralized logs, backups, WAF/CDN policy, vulnerability scanning, incident response, and periodic review.

## Completed in this pass

### Authentication and session hardening

- `JWT_SECRET` is required in production and must be at least 32 characters.
- Auth JWTs use fixed issuer/audience and HS256 allowlist.
- Session lifetime is capped at 7 days; `.env.example` documents a 24h baseline.
- Auth cookies are `HttpOnly`, `Secure` in production, `SameSite=Strict`, `path=/`, and high priority.
- Public registration remains disabled unless `ENABLE_PUBLIC_REGISTRATION=true` is intentionally set.
- Login and registration attempts emit structured audit logs without storing raw email/IP/user-agent.

### Request and API protection

- Proxy enforces allowed hosts to reduce Host-header abuse.
- Proxy blocks unsupported methods globally.
- Unsafe API methods are protected by same-origin checks and `Sec-Fetch-Site: cross-site` blocking.
- Request body size limits are enforced for API routes.
- In-memory rate limits cover API and auth routes.
- JSON APIs use `Cache-Control: no-store` and API responses are marked `noindex`.

### High-risk legacy surface reduction

- Disabled old AI mistake-analysis endpoint: `/api/ai/analyze-mistake` now returns 404 for POST.
- Locked `/api/stats` behind admin authentication to avoid public platform telemetry exposure.
- Removed environment-variable external redirect from `/api/mistakes`; it now returns 410.
- Existing retired public ranking/comment/report/C++ runner endpoints remain 404/410 stubs.

### Data integrity checks

- `/api/progress` now validates published lesson existence before writing progress.
- `/api/quiz/submit` now validates question existence under a published lesson/course.
- `/api/wrong` now validates question existence under a published lesson/course.
- Foreign-key errors are handled as clean 404/500 JSON responses instead of uncaught errors.

### Response headers / browser hardening

- CSP tightened to same-origin `connect-src`.
- Security headers include:
  - `Content-Security-Policy`
  - `Strict-Transport-Security`
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy`
  - `Cross-Origin-Opener-Policy`
  - `Cross-Origin-Resource-Policy`
  - `X-Permitted-Cross-Domain-Policies`
  - `X-Download-Options`

### Secrets / environment documentation

- `.env.example` now reflects MySQL/MariaDB production reality instead of PostgreSQL.
- Documents strong JWT generation and host allowlist requirements.
- AI keys are empty by default because AI features are outside the MVP.

## Verification performed

- `node --check next.config.js` ✅
- `node --check prisma/seed.cjs` ✅
- `npm run typecheck` ✅
- `npm run lint` ✅
- `npm run build` ✅
- `npm audit --audit-level=high` ✅ found 0 vulnerabilities
- Local route checks:
  - POST `/api/ai/analyze-mistake` → 404 ✅
  - GET `/api/stats` without login → 401 ✅
  - cross-origin POST `/api/progress` → 403 ✅
  - `/english/vocabulary/ielts-5000` → 200 with security headers ✅

## Remaining enterprise requirements before claiming full enterprise-grade

1. Move rate limiting to Redis/Upstash or gateway-level WAF for multi-instance deployments.
2. Add database-backed session rotation / revocation if stricter compliance is required.
3. Add 2FA for admin accounts.
4. Add admin audit tables for course/lesson/question mutations, not only stdout logs.
5. Add backup/restore runbook and tested restore drills for MySQL/MariaDB.
6. Add dependency scanning in CI and block deploys on high/critical vulnerabilities.
7. Add WAF rules for production domain and bot protection for auth endpoints.
8. Set production environment variables:
   - `JWT_SECRET` strong random value
   - `APP_ALLOWED_HOSTS=vantaapi.com,www.vantaapi.com`
   - `ENABLE_PUBLIC_REGISTRATION=false`
9. Review Vercel project access, GitHub branch protection, and deployment approvals.

## Deployment note

This pass has not been deployed. Review the diff, then deploy explicitly when ready.
