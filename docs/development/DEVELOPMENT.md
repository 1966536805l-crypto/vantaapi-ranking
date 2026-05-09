# Immortal Study MVP

MVP scope:

- User register / login / logout
- English learning path
- C++ learning path
- Lesson content, examples, practice and quiz
- Progress saving
- Wrong-question collection
- Admin content CRUD
- MySQL / MariaDB + Prisma + Next.js + TypeScript + Tailwind CSS

Not in v1:

- Community
- Live classes
- AI teacher
- Payments
- Online C++ runner / auto judge

## Local setup

1. Start MySQL / MariaDB.

If Docker is available:

```bash
docker compose up -d mariadb
```

Or create your own MySQL / MariaDB database and set:

```bash
DATABASE_URL="mysql://<db_user>:<strong-random-password>@127.0.0.1:3306/<db_name>"
```

2. Install and generate Prisma client:

```bash
npm install
npm run prisma:generate
```

3. Apply schema and seed content:

```bash
npx prisma migrate deploy
npm run db:seed
```

For quick local reset during development:

```bash
npx prisma db push
npm run db:seed
```

4. Run development server:

```bash
npm run dev:3001
```

Open:

- http://localhost:3001

## Admin initialization

Production no longer creates public default admin credentials. To intentionally create an admin, pass explicit environment variables:

```bash
SEED_ADMIN_EMAIL="your-admin@example.com" SEED_ADMIN_PASSWORD="strong-12-char-password" npm run db:seed
```

Demo student users are also opt-in. Set `SEED_DEMO_USERS=true` and `SEED_STUDENT_PASSWORD` only for local demos.

## Test commands

```bash
npm run lint
npm run typecheck
npm run build
```

## Admin

Open `/admin` after logging in as the admin user.

Admin can create, edit and delete:

- courses
- lessons
- questions

For multiple-choice options in the admin form, enter one option per line and prefix the correct option with `*`.
