# JinMing Lab

JinMing Lab is a focused GitHub launch audit and AI developer tools platform.

The product direction is now:

- GitHub Launch Audit as the main public product
- AI developer utilities for prompts API snippets JSON regex timestamps and roadmaps
- Programming practice as a secondary learning lane

English and legacy learning modules can remain available, but they are secondary to the main positioning.

## MVP Scope

- Public GitHub Launch Audit with scorecard evidence P0/P1/P2 findings issue drafts PR description and release checklist
- Public AI tools page with practical developer utilities
- Programming learning paths and practice workbenches
- Login, dashboard, progress, wrong answer review and admin CRUD
- Security baseline with auth cookies, password hashing, rate limits, Turnstile support, security headers, robots and sitemap

Not in the first focused version:

- Payment
- Live streaming
- Forum
- Official exam question reproduction
- Online C++ judge or untrusted code execution as a public feature

## Stack

- Next.js + TypeScript
- Tailwind CSS
- Prisma
- Postgres through Vercel/Neon in the current production setup

## Local Development

1. Configure `.env`:

```bash
DATABASE_URL="postgresql://<db_user>:<strong-random-password>@<db_host>:5432/<db_name>?sslmode=require"
JWT_SECRET="<generate-a-random-secret-at-least-32-chars>"
```

2. Install dependencies and generate Prisma Client:

```bash
npm install
npm run prisma:generate
```

3. Initialize database and seed data:

```bash
npx prisma migrate deploy
npm run db:seed
```

4. Start the local server:

```bash
npm run dev:3001
```

Open <http://localhost:3001>.

## Optional local AI fallback

For a no-per-request local fallback, install Ollama on the same machine that runs Next.js:

```bash
ollama pull qwen2.5:3b
ollama serve
```

Then add these values to `.env`:

```bash
OLLAMA_ENABLED="true"
OLLAMA_BASE_URL="http://127.0.0.1:11434"
OLLAMA_MODEL="qwen2.5:3b"
```

The app will try `AI_API_KEY` first, then Ollama, then the built-in coach fallback. Vercel cannot reach Ollama on your personal computer; use this for local development or a self-hosted server running Ollama beside the app.

## Admin initialization

Production no longer creates public default admin credentials. To intentionally create an admin, pass explicit environment variables:

```bash
SEED_ADMIN_EMAIL="your-admin@example.com" SEED_ADMIN_PASSWORD="strong-12-char-password" npm run db:seed
```

Demo student users are also opt-in. Set `SEED_DEMO_USERS=true` and `SEED_STUDENT_PASSWORD` only for local demos.

## Verification

```bash
npm run typecheck
npm run lint
npm run build
npx prisma validate
```

## Production Launch Gate

Before public launch, configure these in Vercel Production environment variables:

```bash
DATABASE_URL="postgresql://..."
JWT_SECRET="..."
CSRF_SECRET="..."
ENCRYPTION_KEY="..."
NEXT_PUBLIC_TURNSTILE_SITE_KEY="..."
TURNSTILE_SECRET_KEY="..."
AUTH_TURNSTILE_REQUIRED="true"
AI_API_KEY="..."
ENABLE_CPP_RUNNER="false"
ADMIN_2FA_REQUIRED="true"
```

Recommended:

```bash
REDIS_URL="..."
ENABLE_REDIS_RATE_LIMITS="true"
GITHUB_READ_TOKEN="..."
```

Generate the app-owned secrets locally:

```bash
npm run launch:secrets
```

This prints launch-ready values for `JWT_SECRET`, `CSRF_SECRET`, and `ENCRYPTION_KEY`, plus Vercel CLI helper commands. It does not write files and does not upload anything.

Then run:

```bash
npm run launch:production
npm run build
```

`launch:production` checks Vercel Production variable presence, pulls Production env into the ignored `.env.vercel.production.local` file, then validates the pulled values without printing secrets.

If `launch:production` reports empty Vercel values, remove or edit those variables in Vercel Production first. For app-owned secrets, rerun `npm run launch:secrets`; for provider values, copy fresh values from Postgres, your AI provider, and Cloudflare Turnstile.

Manual equivalent:

```bash
npm run launch:vercel
npm run launch:check
npm run build
```

`launch:vercel` checks that required variables exist in the Vercel Production scope without printing secret values.

`launch:check` validates the values available to the current shell or pulled env file. If it fails, it prints the next launch actions to fix in Vercel, Cloudflare, or the database provider.

If Vercel is configured but local `launch:check` still sees stale values, pull production env into a local ignored file first:

```bash
vercel env pull .env.vercel.production.local --environment=production
PRELAUNCH_ENV_FILE=.env.vercel.production.local PRELAUNCH_IGNORE_PROCESS_ENV=true npm run launch:check
```

## Admin

After signing in as an admin, open `/admin`.

The admin area manages:

- Course
- Lesson
- Question

For choice options, enter one option per line and prefix the correct option with `*`.
