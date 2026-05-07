# Supply Chain Security Baseline

This project keeps supply-chain checks strict without adding runtime friction for learners.

## Package install rules

- Use `npm ci` for reproducible installs.
- Keep `package-lock.json` committed.
- Do not use `git:`, `http:`, `file:`, `link:`, wildcard, or workspace dependency specs in production `package.json`.
- Keep root install lifecycle scripts (`preinstall`, `install`, `postinstall`, `prepare`) absent unless explicitly reviewed.
- Use `.npmrc` to prefer exact saved versions and lockfile-based installs.

## CI gates

CI runs:

```bash
npm run security:repo
npm run security:network
npm run security:supply-chain
npm run security:secrets
npm audit --audit-level=high
npm run typecheck
npm run lint
npm run build
```

Security workflows also use locked npm installs. Where practical, dependency install scripts are disabled in CI before explicit project commands run.

## Secret hygiene

Never commit:

- `.env` or `.env.*`
- database dumps or local SQLite files
- private keys or certificates
- provider API keys
- session/JWT tokens
- Vercel project metadata

Run before pushing:

```bash
npm run security:secrets
```

GitHub also runs Gitleaks on push and pull requests.

## Dependency maintenance

Dependabot is enabled for:

- npm packages
- GitHub Actions

Review dependency PRs with:

```bash
npm ci
npm run security:full
```

Do not merge major dependency updates if they weaken auth, CSRF, rate limits, CSP, or build reproducibility.

## Incident response

If a secret is accidentally committed:

1. Revoke/rotate it immediately.
2. Remove it from the repo.
3. Check GitHub secret scan/Gitleaks results.
4. Assume the secret is compromised even if the repository is private.
5. Redeploy with the rotated secret.

If a dependency advisory is high/critical:

1. Check whether the vulnerable path is reachable.
2. Prefer patch/minor upgrades first.
3. Keep `npm audit --audit-level=high` green.
4. Document any temporary exception in the PR.
