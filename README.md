# JinMing Lab

**A free learning and developer tools website for English practice, programming practice, and GitHub launch checks.**

Try it online: <https://vantaapi.com>

## Highlights

- **English word typing practice**: choose exam or school vocabulary, hear pronunciation, read examples, type the word, save progress, and use focus mode.
- **Vocabulary banks**: primary school, middle school, high school, university, CET, TEM, IELTS, TOEFL, GRE, GMAT, SAT/ACT, postgraduate, and doctoral English practice packs.
- **Custom word books**: add your own words one by one or import many lines at once for personal practice.
- **Anki resources**: import ready-made daily English vocabulary from [`anki/daily-english-vocab.tsv`](anki/daily-english-vocab.tsv).
- **Programming practice**: C++ and programming learning surfaces for structured review.
- **GitHub launch audit**: check README quality, environment expectations, CI, security posture, and release readiness.

## Who It Helps

- Students preparing English exams or building daily vocabulary.
- Learners who want a clean typing-based memorization tool with examples and pronunciation.
- Developers who want practical launch checks before publishing a project.
- Teachers or self-learners who want a quick custom word bank workflow.

## Popular Links

- English home: <https://vantaapi.com/english?lang=zh>
- Word typing: <https://vantaapi.com/english/word-typing?lang=zh>
- Vocabulary hub: <https://vantaapi.com/english/vocabulary?lang=zh>
- GitHub repo analyzer: <https://vantaapi.com/tools/github-repo-analyzer>

## Core Product

**Learning tools and GitHub Launch Audit** are the public focus areas.

The English learning surface includes vocabulary, reading, grammar, quiz, and word typing practice. The GitHub Launch Audit offers deterministic, rules-based repository analysis:
- README quality and completeness checks
- Environment configuration validation
- CI/CD pipeline verification
- Deployment readiness assessment
- Security baseline evaluation
- Release checklist generation

The audit engine is deterministic and rules-first. AI-powered suggestions enhance the experience but don't replace the core analysis.

**AI Developer Tools** also provide practical utilities for daily development, including prompt templates, API snippets, validators, timestamp helpers, and roadmap generators.

## MVP Scope

- English learning pages with word typing, vocabulary, question banks, reading, grammar, and custom word books
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

## Tech Stack

- **Framework**: Next.js 16 + React 19 + TypeScript 5
- **Styling**: Tailwind CSS 4
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT + bcrypt + 2FA (TOTP)
- **Security**: CSRF protection, Redis rate limiting, Cloudflare Turnstile
- **Deployment**: Vercel (production), supports self-hosted
- **Testing**: Vitest with coverage reporting

## Quick Start

1. Configure `.env`:

```bash
DATABASE_URL="postgresql://<db_user>:<strong-random-password>@<db_host>:5432/<db_name>?sslmode=require"
JWT_SECRET="<generate-a-random-secret-at-least-32-chars>"
```

2. Install dependencies and generate Prisma Client:

```bash
npm ci
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

Run the full quality check suite:

```bash
npm run typecheck
npm run lint
npm run test
npm run build:ci
npm run content:check
npx prisma validate
```

Use `npm run build` when `DATABASE_URL` is set to the real target database. Use `npm run build:ci` for local or CI compile verification when you only need a safe Postgres-shaped placeholder.

## Testing

```bash
npm test              # Run tests in watch mode
npm run test:run      # Run tests once
npm run test:ui       # Open Vitest UI
```

## Documentation

Comprehensive documentation is available in the [`docs/`](docs/) directory:

- [Development Guide](docs/development/DEVELOPMENT.md)
- [Environment Setup](docs/development/ENV_GUIDE.md)
- [Deployment Guide](docs/deployment/DEPLOYMENT.md)
- [Security Policy](docs/security/SECURITY.md)
- [Collaboration Guidelines](docs/collaboration/COLLABORATION.md)

## Production Launch

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

Use this short launch path:

```bash
npm run launch:providers
npm run launch:secrets
npm run launch:production
npm run content:check
npm run build
```

Before deploying, keep the local app running and verify language routing:

```bash
npm run language:smoke -- --base=http://127.0.0.1:3003
```

Deploy after those pass. Then verify the live URL:

```bash
npm run launch:smoke
```

To check a preview deployment instead of the production domain:

```bash
npm run launch:smoke -- --base=https://your-preview-url.vercel.app
```

What the commands do:

- `launch:providers` tells you where to copy provider-owned values from: database, AI provider, GitHub, Turnstile, Redis.
- `launch:secrets` prints fresh app-owned secrets for `JWT_SECRET`, `CSRF_SECRET`, and `ENCRYPTION_KEY`.
- `launch:production` checks Vercel Production variables, pulls them into an ignored local env file, and validates them without printing secrets.
- `content:check` blocks old brand residue, half-focused public positioning, and exaggerated exact content claims.
- `language:smoke` checks multilingual routing, RTL document direction, localized surfaces, and explicit URL language precedence over old cookies.
- `launch:smoke` checks the deployed site, robots, sitemap, retired API responses, and the GitHub Audit endpoint.

Generate the app-owned secrets locally:

```bash
npm run launch:secrets
```

This prints launch-ready values for `JWT_SECRET`, `CSRF_SECRET`, and `ENCRYPTION_KEY`, plus Vercel CLI helper commands. It does not write files and does not upload anything.

To automatically rotate only those three app-owned secrets in Vercel Production:

```bash
npm run launch:fix-secrets -- --apply
```

Without `--apply`, the command is a dry run and only prints what it would do.

This does not touch `DATABASE_URL`, `AI_API_KEY`, or Turnstile keys because those must come from external provider dashboards.

For those provider-owned values, print the source checklist:

```bash
npm run launch:providers
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

After signing in as an admin, access the admin panel at `/admin`.

The admin area manages courses, lessons, and questions for the programming practice feature.

For choice options, enter one option per line and prefix the correct option with `*`.

## Contributing

See [COLLABORATION.md](docs/collaboration/COLLABORATION.md) for team workflow and contribution guidelines.

## Security

Report security vulnerabilities privately through GitHub's security advisory feature. See [SECURITY.md](docs/security/SECURITY.md) for our security policy.

## License

MIT License - see [LICENSE](LICENSE) for details.
