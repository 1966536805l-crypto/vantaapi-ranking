# Environment Configuration Guide

This project uses different environment files for different purposes:

## Files

- `.env` - Local development environment variables (gitignored)
- `.env.example` - Template with all required variables and descriptions
- `.env.production` - Production-specific overrides (gitignored)
- `.env.vercel.production.local` - Auto-generated from Vercel (gitignored)

## Setup for Local Development

1. Copy the example file:
```bash
cp .env.example .env
```

2. Fill in the required values:
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/dbname?sslmode=require"
JWT_SECRET="generate-with-openssl-rand-base64-32"
CSRF_SECRET="generate-with-openssl-rand-base64-32"
ENCRYPTION_KEY="generate-with-openssl-rand-base64-32"
```

3. Generate secrets:
```bash
npm run launch:secrets
```

## Setup for Production

See the main README.md for production deployment instructions.

Use these commands:
```bash
npm run launch:providers  # Get provider setup checklist
npm run launch:secrets    # Generate app secrets
npm run launch:production # Validate Vercel production env
```

## Required Variables

### Core
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret (32+ chars)
- `CSRF_SECRET` - CSRF token secret (32+ chars)
- `ENCRYPTION_KEY` - Data encryption key (32+ chars)

### Security
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` - Cloudflare Turnstile site key
- `TURNSTILE_SECRET_KEY` - Cloudflare Turnstile secret
- `AUTH_TURNSTILE_REQUIRED` - Enable Turnstile (true/false)
- `ADMIN_2FA_REQUIRED` - Require admin 2FA (true/false)

### Optional
- `REDIS_URL` - Redis connection for rate limiting
- `ENABLE_REDIS_RATE_LIMITS` - Enable Redis rate limits (true/false)
- `AI_API_KEY` - AI provider API key
- `GITHUB_READ_TOKEN` - GitHub API token for audit features
- `OLLAMA_ENABLED` - Enable local Ollama fallback (true/false)
- `OLLAMA_BASE_URL` - Ollama server URL
- `OLLAMA_MODEL` - Ollama model name

## Security Notes

- Never commit `.env` files with real secrets
- Use strong random values for all secrets
- Rotate secrets regularly in production
- Use `npm run launch:fix-secrets -- --apply` to rotate app-owned secrets in Vercel
