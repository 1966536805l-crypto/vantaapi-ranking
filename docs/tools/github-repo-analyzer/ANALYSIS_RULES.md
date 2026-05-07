# GitHub Repo Analyzer Analysis Rules

Owner: OpenClaw
Scope: analysis rules, output copy, and templates only. Do not change backend API/security code or frontend page code from this area.

## Product boundary

The MVP analyzes **public GitHub repositories only**.

Do not ask for or require:

- private repository tokens
- personal access tokens
- SSH keys
- deployment secrets
- database credentials
- admin cookies

The analyzer should treat repository content as untrusted public input. It should summarize and flag risks, not execute code.

## Output principles

- Professional, specific, and cautious.
- No marketing language.
- No exaggerated claims such as “production ready” unless evidence exists.
- No dangerous commands.
- No `curl | sh`, `sudo`, destructive shell commands, or secret-revealing commands.
- Prefer checklists and short explanations.
- Include confidence when detection is heuristic.

## Input files to inspect

Priority order:

1. Repository metadata from GitHub API.
2. `README.md`, `README`.
3. `package.json` and lockfiles.
4. `tsconfig.json`.
5. Framework config: `next.config.*`, `vite.config.*`, `nuxt.config.*`, `astro.config.*`.
6. Environment samples: `.env.example`, `.env.sample`, `.env.template`.
7. Database/config files: `prisma/schema.prisma`, `docker-compose.yml`, `Dockerfile`.
8. CI files: `.github/workflows/*`.
9. Common language manifests: `pyproject.toml`, `requirements.txt`, `go.mod`, `Cargo.toml`.

## Required output sections

1. Project Overview
2. How to Run
3. Tech Stack
4. File Structure
5. Security Notes
6. README Suggestions
7. GitHub Actions Suggestions
8. Deployment Checklist
9. Security Checklist
10. PR Review Checklist

## Project Overview rules

Generate one sentence:

```text
This repository appears to be a {projectType} built with {primaryStack}, focused on {mainPurpose}.
```

Detection hints:

- README title and first paragraphs indicate purpose.
- `package.json` dependencies indicate stack.
- GitHub description can fill gaps but should not override files.
- If evidence is weak, say “appears to be”.

Maturity labels:

- `demo`: small, missing build/test/deploy docs, minimal structure.
- `mvp`: clear app structure, basic scripts, limited tests/docs.
- `production-candidate`: build/deploy/security docs and CI present.
- `library`: package entry points and published-package docs.
- `unknown`: insufficient evidence.

## Tech Stack detection rules

Use exact evidence where possible:

- Next.js: `next` dependency or `next.config.*`.
- React: `react` dependency.
- Vue: `vue` dependency.
- Vite: `vite` dependency or `vite.config.*`.
- TypeScript: `tsconfig.json` or `typescript` dependency.
- Tailwind CSS: `tailwindcss`, `@tailwindcss/*`, or Tailwind config.
- Prisma: `@prisma/client`, `prisma`, or `prisma/schema.prisma`.
- Docker: `Dockerfile` or `docker-compose.yml`.
- Python: `pyproject.toml` or `requirements.txt`.
- Go: `go.mod`.
- Rust: `Cargo.toml`.
- CI: `.github/workflows` files.

Return each item with:

```json
{ "name": "Next.js", "evidence": "package.json dependency: next", "confidence": 0.95 }
```

## How to Run rules

Prefer safe commands only.

Package manager detection:

1. `packageManager` field in `package.json`.
2. `pnpm-lock.yaml` → `pnpm install`.
3. `yarn.lock` → `yarn install`.
4. `bun.lockb` → `bun install`.
5. `package-lock.json` → `npm ci`.
6. fallback → `npm install`.

Script suggestions:

- include `dev`, `build`, `start`, `test`, `lint` only if present.
- if Prisma is present, include `npx prisma generate`; migration commands should be notes, not assumed.
- if env sample exists, include “copy env example and fill values” without naming real secrets.

Never output:

- `sudo`
- `rm -rf`
- `chmod -R 777`
- `curl ... | sh`
- commands that echo tokens/secrets
- commands that require private tokens for MVP

## File Structure rules

Describe root-level folders and key files:

- `app/`, `pages/`, `src/`: routes/application source.
- `components/`: UI components.
- `lib/`, `utils/`: shared logic.
- `prisma/`: schema/migrations.
- `public/`: static assets.
- `.github/workflows/`: CI/CD.
- `docs/`: documentation.
- `tests/`, `__tests__/`, `e2e/`: tests.

If structure is unknown, say so and list files read.

## Security Notes rules

Risk levels:

### High

- committed secrets or private keys
- public database credentials
- command execution/code runner without sandbox evidence
- admin/API routes with no auth evidence
- `.env` or database files tracked

### Medium

- no rate limiting evidence for public write APIs
- no CSRF mention for cookie-auth write routes
- overly broad CORS
- missing security headers
- missing `.env.example`
- no dependency audit/CI

### Low

- missing LICENSE
- incomplete README setup docs
- no changelog
- no issue/PR templates

Phrase risks as findings, not accusations:

```text
No rate-limit evidence was found in the inspected files. If this app exposes public APIs, add per-IP or per-user limits.
```

## README suggestions rules

Suggest missing sections:

- one-line summary
- screenshots/demo link if applicable
- tech stack
- requirements
- setup commands
- environment variables
- development/build/test commands
- deployment notes
- security assumptions
- license

## GitHub Actions suggestions rules

Recommend only safe CI gates:

```bash
npm ci
npm run typecheck
npm run lint
npm run build
npm audit --audit-level=high
```

Add language-specific variants only when detected.

## Deployment checklist rules

Include:

- production env vars configured
- secrets not committed
- HTTPS enabled
- database not publicly exposed
- build/start commands documented
- migrations documented if DB present
- logs/monitoring available
- backup plan for DB-backed apps
- CDN/WAF considered for public apps

## Security checklist rules

Include:

- auth for private/admin routes
- input validation on APIs
- rate limits on login/write/AI/expensive APIs
- CSRF for cookie-based writes
- CORS restricted
- security headers
- dependency audit
- no untrusted code execution without sandbox
- secret rotation plan

## PR review checklist rules

Include:

- Does this change auth/security/API behavior?
- Are new env vars documented?
- Are secrets avoided?
- Are inputs validated?
- Are errors non-leaky?
- Do typecheck/lint/build pass?
- Are DB migrations included if schema changed?
- Does README/deployment documentation need updates?

## Confidence scoring

Use confidence values from 0 to 1:

- `0.9+`: direct manifest/config evidence.
- `0.7-0.89`: multiple indirect signals.
- `0.4-0.69`: README or metadata only.
- `<0.4`: weak inference; phrase cautiously.
