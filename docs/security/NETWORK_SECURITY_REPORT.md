# Network Security Hardening Report

Date: 2026-05-06
Scope: local Mac host + OpenClaw + `vantaapi-ranking` local/production network posture. No firewall, SSH, OS service, or production deployment changes were made in this pass.

## Read-only findings

### Host posture

- OS: macOS 26.3 / Darwin 25.3.0.
- User is in admin-related groups.
- FileVault: On.
- Automatic update checking: On.
- Time Machine: not currently running during the check.
- macOS Application Firewall: Disabled.
- PF status required elevated permission and was not modified.

### Exposed local listeners observed

Important listeners bound to all interfaces (`*`) or LAN-facing addresses:

- `*:3000` — Next.js server from `vantaapi-ranking`.
- `*:3001` — Next.js dev server from `vantaapi-ranking`.
- `*:3002` — Next.js preview/start server from `vantaapi-ranking`.
- `*:3012` — Next.js preview server from `vantaapi-ranking`.
- `*:5000` / `*:7000` — macOS Control Center process.
- `192.168.1.66:1082` — MacPacket proxy/listener.

Most other listeners were loopback-only (`127.0.0.1` / `::1`).

### OpenClaw posture

- Security audit: 0 critical, 1 warning, 1 info.
- Warning: `gateway.trusted_proxies_missing` — only relevant if Control UI is exposed through a reverse proxy. If local-only, keep it local-only. If reverse-proxied, configure `gateway.trustedProxies` to the proxy IPs.
- OpenClaw update: available (`2026.5.5`). Update was not run because user did not explicitly request self-update.

### vantaapi network posture

Already in place from prior hardening:

- Host header allowlist in `proxy.ts`.
- Same-origin and `Sec-Fetch-Site` blocking for unsafe API methods.
- Method allowlist.
- Body size limits.
- API rate limit.
- Strong browser security headers.
- API `no-store` / `noindex`.
- Retired public/AI/C++ runner endpoints return 404/410.

## Changes made in this pass

### Local Next.js bind-address hardening

Updated `package.json` scripts so future local dev/preview/start servers bind to localhost only:

```json
{
  "dev": "next dev --hostname 127.0.0.1",
  "start": "next start --hostname 127.0.0.1",
  "dev:3001": "next dev --hostname 127.0.0.1 --port 3001",
  "preview": "next start --hostname 127.0.0.1 --port 3002"
}
```

This reduces accidental LAN exposure during local development. It does not affect Vercel production deployment.

## Recommended next actions requiring explicit approval

1. Stop duplicate Next.js local servers currently listening on all interfaces (`*:3000`, `*:3001`, `*:3002`, `*:3012`), then restart only the needed dev server on `127.0.0.1:3001`.
2. Enable macOS Application Firewall.
3. Review whether Remote Login / Screen Sharing / Remote Apple Events are needed; your user is in access groups, so this deserves verification before changing.
4. Decide whether `MacPacket` on LAN port `1082` is required. If not, close/quit it.
5. If OpenClaw Control UI is reverse-proxied, configure `gateway.trustedProxies`; if not, keep it local-only and accept the audit warning.
6. Consider running OpenClaw update to `2026.5.5` when you explicitly want self-update.
7. Add periodic security audits if desired.

## Suggested approval command set for local cleanup

Only run after user confirms:

```bash
# Stop vantaapi local Next.js servers found in audit
kill 26058 56457 84598 93596 2>/dev/null || true

# Restart a single localhost-only dev server
cd /Users/euhualihuawaiigeeeeegehanggeyewo/vantaapi-ranking
DATABASE_URL="$DATABASE_URL" npm run dev:3001
```

## Firewall hardening plan requiring confirmation

Do not run without confirmation:

```bash
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate on
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setstealthmode on
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setallowsigned on
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getstealthmode
```

Risk: enabling firewall can block inbound LAN access for apps/services. It should be safe for normal browser/app use, but confirm whether you depend on LAN access first.

## 2026-05-06 23:27 follow-up hardening

Additional code/deployment hardening completed without touching system firewall or stopping services:

- `docker-compose.yml`
  - MariaDB port binding changed from `3306:3306` to `127.0.0.1:3306:3306` so the database is not exposed to LAN/Internet by Docker.
  - Removed hardcoded weak `root` password from compose; now requires strong values through environment variables.
  - Added app DB user/password variables instead of relying on root-only local DB access.
- `.env.example`
  - Added MariaDB root/app password placeholders.
  - Production `APP_ALLOWED_HOSTS` now documents only canonical public hosts (`vantaapi.com,www.vantaapi.com`); local dev should omit the variable or override it locally.
- `deploy-baota.sh`
  - Production `.env` generation now sets:
    - `NEXT_TELEMETRY_DISABLED=1`
    - `ENABLE_PUBLIC_REGISTRATION=false`
    - `AUTH_SESSION_SECONDS=86400`
    - `APP_ALLOWED_HOSTS=vantaapi.com,www.vantaapi.com`
- `DEPLOYMENT.md`
  - Replaced basic Nginx reverse-proxy example with a hardened HTTPS-oriented config:
    - HTTP to HTTPS redirect
    - HSTS
    - `X-Frame-Options`, `nosniff`, referrer policy
    - small request body limit
    - hidden-file / repo / env / node_modules deny rules
    - API/auth rate-limit placeholders
    - forwarded proto/host headers

Verification:

- `npm run typecheck` passed.
- `npm run lint` passed.
- `npm run build` passed.
- `npm audit --audit-level=high` passed with 0 vulnerabilities.
- `docker compose config` could not be run locally because Docker CLI is not installed in this environment.

Still requires explicit confirmation before changing host state:

- macOS Application Firewall is still disabled.
- Stealth mode is still off.
- A Next.js process is still listening on `*:3000` and should be stopped/restarted on localhost-only if it is not intentionally exposed.
- `MacPacket` is still listening on LAN address `192.168.1.66:1082`; confirm whether it is needed before closing it.
- OpenClaw update `2026.5.5` is available but was not run because self-update requires explicit request.

## 2026-05-06 23:34 user chose option 3

User chose option 3: stop old `*:3000` vantaapi listener and enable macOS Firewall + stealth mode.

Actions attempted/completed:

- Found `*:3000` listener PID `84598`, cwd `/Users/.../vantaapi-ranking`, command `next-server (v16.2.4)`.
- Sent TERM, then KILL because it kept listening.
- The process supervisor automatically restarted Next.js on `127.0.0.1:3000`, which is acceptable because it is localhost-only and no longer LAN-facing.
- Tried to enable macOS Application Firewall and stealth mode. Direct root execution was unavailable in this webchat runtime; non-root command failed with `Must be root to change settings`.
- Tried `osascript ... with administrator privileges` to trigger a macOS admin prompt, but the authorization prompt was not completed before timeout.

Post-check:

- vantaapi/Next listeners are now localhost-only: `127.0.0.1:3000`, `127.0.0.1:3001`, `127.0.0.1:3003`.
- macOS Application Firewall remains disabled.
- Stealth mode remains off.
- Remaining LAN-facing listeners observed: macOS Control Center on `*:5000`/`*:7000`, MacPacket on `192.168.1.66:1082`.

Manual command needed to complete firewall hardening:

```bash
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate on && \
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setstealthmode on && \
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setallowsigned on && \
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setallowsignedapp on && \
/usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate && \
/usr/libexec/ApplicationFirewall/socketfilterfw --getstealthmode
```
