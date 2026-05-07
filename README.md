# VantaAPI

VantaAPI is a focused AI tools and programming practice platform.

The product direction is now:

- AI tools for prompts code explanation bug diagnosis API snippets and developer utilities
- Coding practice for zero foundation learners and independent developers
- Learning roadmaps that turn a direction into a practical daily plan

English and legacy learning modules can remain available, but they are secondary to the main positioning.

## MVP Scope

- Public AI tools page with six practical tools
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

## Admin

After signing in as an admin, open `/admin`.

The admin area manages:

- Course
- Lesson
- Question

For choice options, enter one option per line and prefix the correct option with `*`.
