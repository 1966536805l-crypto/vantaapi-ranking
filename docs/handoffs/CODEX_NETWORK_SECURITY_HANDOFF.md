# Codex Network Security Handoff

## User request

鱼要求继续加强 OpenClaw / Codex / vantaapi 的网络安全。

## Read-only audit findings

- macOS Application Firewall is disabled.
- FileVault is On.
- Automatic update checking is On.
- OpenClaw security audit: 0 critical, 1 warning, 1 info.
  - Warning: `gateway.trusted_proxies_missing` — only relevant if Control UI is exposed through a reverse proxy. Do not configure blindly; confirm proxy IPs first.
- OpenClaw update is available: `2026.5.5`; do not update unless user explicitly asks for self-update.
- vantaapi local Next.js processes currently listening on all interfaces:
  - `*:3000`
  - `*:3001`
  - `*:3002`
  - `*:3012`
- Additional notable listeners:
  - macOS Control Center `*:5000`, `*:7000`
  - MacPacket `192.168.1.66:1082`

## Changes made

- Updated `package.json` local scripts so future Next.js local servers bind to localhost only:
  - `dev`: `next dev --hostname 127.0.0.1`
  - `start`: `next start --hostname 127.0.0.1`
  - `dev:3001`: `next dev --hostname 127.0.0.1 --port 3001`
  - `preview`: `next start --hostname 127.0.0.1 --port 3002`
- Added `NETWORK_SECURITY_REPORT.md` with findings, recommended actions, and commands requiring approval.

## Verification

- `npm run typecheck` ✅
- `npm run lint` ✅
- `npm run build` ✅
- `npm audit --audit-level=high` ✅ 0 vulnerabilities

## Do not do without explicit user confirmation

- Do not enable macOS firewall without confirmation.
- Do not kill running Next.js/local services without confirmation.
- Do not change SSH / Screen Sharing / Remote Apple Events without confirming access path.
- Do not run `openclaw update` unless user explicitly asks for self-update.
- Do not configure `gateway.trustedProxies` unless the reverse proxy IP is known.

## Recommended next user choices

1. Stop duplicate vantaapi local servers and restart one localhost-only dev server.
2. Enable macOS Application Firewall + stealth mode.
3. Review/close MacPacket LAN listener if not needed.
4. Leave system services alone; only keep app-level hardening.
