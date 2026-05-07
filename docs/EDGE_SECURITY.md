# Edge Security and DDoS Baseline

This project keeps user experience usable by handling heavy DDoS and bot filtering at the edge, while the app keeps precise authentication, CSRF, and rate-limit controls.

## Required edge posture

Use Cloudflare, Vercel Firewall, or an equivalent CDN/WAF in front of production.

Minimum production rules:

1. **DDoS protection:** enabled at the provider/CDN layer.
2. **HTTPS only:** redirect HTTP to HTTPS; use Full (strict) TLS when behind Cloudflare.
3. **Origin isolation:** only CDN/WAF IPs may reach the origin server on `80/tcp` and `443/tcp`.
4. **No internal ports exposed:** never expose `3000`, `3306`, Redis, Prisma Studio, PM2 dashboards, or admin panels directly.
5. **Managed WAF rules:** enable OWASP/core managed rules in log/simulate mode first, then block after checking false positives.
6. **Bot filtering:** challenge suspicious automation, but do not challenge normal static pages by default.
7. **Admin hardening:** apply stricter rules to `/admin`, `/api/admin/*`, login, register, and AI endpoints.

## Cloudflare recommended configuration

### DNS and TLS

- Proxy records: orange cloud on for `vantaapi.com` and `www.vantaapi.com`.
- SSL/TLS mode: **Full (strict)**.
- Always Use HTTPS: **On**.
- Automatic HTTPS Rewrites: **On**.
- Minimum TLS version: **TLS 1.2** or higher.

### WAF managed rules

Enable:

- Cloudflare Managed Ruleset.
- OWASP Core Ruleset.
- Known bots allowlist for verified search crawlers.

Start in monitor/log mode for 24 hours if the site already has traffic; then switch obvious malicious classes to block.

### Low-friction rate rules

These rules protect expensive endpoints without bothering normal users:

- `/api/auth/login`: challenge or rate-limit bursts above normal login behavior.
- `/api/auth/register`: challenge or rate-limit; keep public registration disabled unless needed.
- `/api/ai/coach`: rate-limit by authenticated user and IP; the app already requires login.
- `/api/admin/*`: require authenticated admin in app, plus WAF challenge for suspicious traffic.
- `/.env`, `/.git/*`, `/wp-login.php`, `/xmlrpc.php`, `/phpmyadmin/*`: block.

Suggested Cloudflare custom rules:

```text
(http.request.uri.path contains "/.env") or
(http.request.uri.path contains "/.git") or
(http.request.uri.path eq "/wp-login.php") or
(http.request.uri.path eq "/xmlrpc.php") or
(http.request.uri.path contains "/phpmyadmin")
→ Block
```

```text
(http.request.uri.path starts_with "/api/admin") or
(http.request.uri.path eq "/admin")
→ Managed Challenge when bot score is low or country/ASN is unexpected
```

```text
(http.request.uri.path eq "/api/auth/login") or
(http.request.uri.path eq "/api/auth/register") or
(http.request.uri.path eq "/api/ai/coach")
→ Rate limit / Managed Challenge on burst traffic
```

## Origin firewall baseline

If self-hosting behind Cloudflare, restrict origin inbound to Cloudflare IP ranges only. If using Vercel, keep application host allowlist tight and do not expose any database or Redis endpoint publicly.

Required origin rules:

- Allow inbound: `80/tcp`, `443/tcp` from CDN/WAF only.
- Deny inbound: `3000/tcp`, `3306/tcp`, Redis, SSH except from trusted admin IP/tailnet.
- Database and Redis: bind to loopback/private network only.

## User experience line

Do not globally challenge every visitor. Prefer:

- Static and learning pages: allow, cache, and only throttle abusive traffic.
- Login/register/admin/AI APIs: stricter checks.
- Known malicious probes: block immediately.
- Suspicious but not clearly malicious traffic: managed challenge, not hard block.

## Verification

After deployment, run:

```bash
npm run security:full
```

Then verify externally:

- `https://securityheaders.com`
- Cloudflare analytics/WAF events
- Origin security group/firewall: internal ports are not reachable
- App still works for normal login, lessons, quizzes, progress, and admin 2FA
