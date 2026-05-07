# Easy Security Mode / 低麻烦安全模式

目标：把 vantaapi 保持在接近 A 级的安全姿态，同时不让日常使用变得很麻烦。

## 已开启 / 已落地

- macOS Application Firewall: on
- macOS stealth mode: on
- Local Next.js binds to `127.0.0.1` only
- Production host allowlist: `vantaapi.com,www.vantaapi.com`
- Auth cookies: HttpOnly, production Secure, SameSite=Strict
- Public registration: off by default
- Session lifetime: 24h production baseline
- API same-origin guard and `Sec-Fetch-Site` cross-site block
- API/body/rate-limit protections
- Bot trap and suspicious scanner blocking
- MariaDB Docker binding: `127.0.0.1:3306:3306`
- Daily read-only security audit scheduled

## Recommended low-friction production settings

### 1. Cloudflare / CDN WAF, no daily interruption

Use Cloudflare free/pro plan in front of `vantaapi.com`:

- SSL/TLS: Full (strict)
- Always Use HTTPS: on
- Automatic HTTPS Rewrites: on
- Brotli: on
- WAF Managed Rules: on
- Bot Fight Mode: on if it does not block normal users
- Security Level: Medium
- Challenge Passage: 30 minutes

Do **not** challenge every visitor. Only challenge suspicious traffic or auth endpoints if attacks appear.

### 2. Turnstile only for login/register

Turnstile is already wired in the app. To enable it, set:

```env
NEXT_PUBLIC_TURNSTILE_SITE_KEY="your-site-key"
TURNSTILE_SECRET_KEY="your-secret-key"
```

This protects login/register without forcing normal readers to solve challenges.

### 3. Admin 2FA policy

Do not force 2FA for every student account. For low-friction security:

- Admin account: use strong password + password manager now.
- Enable admin-only 2FA later when the admin UI is stable.
- Keep public registration closed unless onboarding is intentional.

### 4. Server firewall / security group

On production server/cloud panel, keep only these inbound ports public:

- 80/tcp
- 443/tcp

Do not expose:

- 3000/tcp
- 3306/tcp
- Redis ports
- PM2/internal dashboards

### 5. Redis / distributed rate limits

Only add Redis if production runs multiple instances or sees abuse. For a small MVP, current in-process + Nginx/CDN limits are simpler.

### 6. Operational routine

- Daily automated read-only audit: enabled.
- Manual monthly check: domain DNS, Cloudflare/WAF, server security group, DB backups.
- Before deployment: run `npm run typecheck`, `npm run lint`, `npm run build`, `npm audit --audit-level=high`.

## What not to overdo yet

To avoid making the site painful to use, do not enable these by default:

- CAPTCHA on every page
- Forced 2FA for students
- Very short sessions such as 15 minutes
- IP allowlist for all users
- Blocking all VPN/proxy traffic

Use stronger friction only when logs show real attacks.


## One-command checks

Run this after security-related edits or before deployment:

```bash
npm run security:check
```

Run the fuller gate when you want stronger confidence:

```bash
npm run security:full
```

`security:check` is read-only. It checks localhost binding, Docker DB exposure, host allowlist, security headers, proxy guards, macOS firewall status, and obvious LAN-facing listeners.
