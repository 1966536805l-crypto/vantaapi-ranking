# GitHub Repo Analyzer Output Template

This is the user-facing analysis structure for the first public-repository MVP.

## Project Overview

```text
{oneSentenceSummary}

Repository:
- Name: {owner}/{repo}
- Default branch: {defaultBranch}
- Primary language: {languageOrUnknown}
- License: {licenseOrMissing}
- Status: {active|archived|unknown}

Maturity estimate: {demo|mvp|production-candidate|library|unknown}
Confidence: {low|medium|high}
```

Good example:

```text
This repository appears to be a Next.js learning platform with TypeScript and Prisma, focused on English and programming practice.
```

Avoid unsupported claims such as "definitely enterprise-grade" or "fully secure".

## How to Run

Only show commands supported by repository evidence.

```text
Recommended setup:
1. Install dependencies: {installCommand}
2. Configure environment: copy the example env file if present, then fill required values locally.
3. Start development: {devCommand}
4. Build: {buildCommand}
```

Safe command examples:

```bash
npm ci
npm run dev
npm run build
npm test
npx prisma generate
```

If migrations are detected, phrase cautiously: review the database setup docs before running migrations.

## Tech Stack

```text
Detected stack:
- {technology}: {evidence}. Confidence: {confidence}
```

## File Structure

```text
Important files and folders:
- README.md: project documentation
- package.json: scripts and dependencies
- app/ or pages/: application routes
- components/: UI components
- lib/: shared logic and helpers
- prisma/: database schema and migrations
- .github/workflows/: GitHub Actions automation
```

## Security Notes

Use severity, evidence, and recommendation.

```text
{severity}: {title}
Evidence: {whatWasFoundOrNotFound}
Recommendation: {specificNextStep}
```

Examples:

```text
Medium: No dependency audit workflow found
Evidence: `.github/workflows` did not include npm audit, CodeQL, or secret scanning.
Recommendation: Add CI gates for dependency audit and static analysis before release.
```

```text
Low: LICENSE is missing
Evidence: No LICENSE file was found at the repository root.
Recommendation: Add a license file so contributors know the usage terms.
```

## README Suggestions

```text
Suggested README additions:
- One-line project summary
- Requirements: Node version, database, package manager
- Quick start commands
- Environment variable table
- Build and test commands
- Deployment notes
- Security assumptions
- License
```

## GitHub Actions Suggestions

```text
Recommended CI gates:
- Install from lockfile
- Typecheck
- Lint
- Build
- Test, if test script exists
- Dependency audit
- Secret scan
- CodeQL for supported languages
```

## Deployment Checklist

```text
- Production environment variables are configured outside Git.
- Database is not publicly exposed.
- HTTPS is enabled.
- Build command is documented.
- Start command is documented.
- Database migrations are documented if applicable.
- Logs and error monitoring are available.
- Backups exist for stateful services.
- CDN/WAF is considered for public web apps.
```

## Security Checklist

```text
- Authentication protects private/admin routes.
- API inputs are validated.
- Login, write, AI, and expensive endpoints are rate-limited.
- Cookie-auth write routes have CSRF protection.
- CORS is restricted.
- Security headers are configured.
- Secrets are stored only in environment variables.
- Dependencies are audited.
- Untrusted code execution is disabled or sandboxed.
```

## PR Review Checklist

```text
Before merging:
- Does this change auth, API, deployment, or security behavior?
- Are new environment variables documented?
- Are secrets avoided?
- Are inputs validated?
- Are error messages safe?
- Do typecheck, lint, build, and tests pass?
- Are migrations included for schema changes?
- Does README or deployment documentation need an update?
```
