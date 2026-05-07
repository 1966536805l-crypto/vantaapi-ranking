# Safe Command Policy

GitHub Repo Analyzer may suggest setup commands, but it must not generate commands that are destructive, privilege-escalating, or secret-revealing.

## Allowed command families

Allowed when supported by repository evidence:

```bash
npm ci
npm install
npm run dev
npm run build
npm run start
npm test
npm run lint
pnpm install
pnpm dev
pnpm build
yarn install
yarn dev
yarn build
bun install
bun run dev
npx prisma generate
```

Language-specific examples are allowed when detected and non-destructive:

```bash
pip install -r requirements.txt
python -m pytest
go test ./...
cargo test
```

## Commands to avoid

Never output:

```text
sudo
rm -rf
curl ... | sh
wget ... | sh
chmod -R 777
cat .env
printenv
env |
docker system prune
kill -9
```

Also avoid commands that:

- expose tokens or environment variables
- change global machine state
- delete user files
- bypass package manager safety checks
- require private repository access in the MVP

## Environment setup phrasing

Prefer:

```text
Copy the example env file if present, then fill required values locally.
```

Avoid:

```text
Paste your GitHub token into the analyzer.
```

## Database migration phrasing

Migrations can change data. Phrase cautiously:

```text
This repository uses Prisma. Review the database setup docs before running migrations.
```

Only suggest migration commands if the repository clearly documents them.
