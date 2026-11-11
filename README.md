# LENSZER Online

Web conversion starter for the uploaded LENSZER desktop database. Built with Next.js 15, Prisma and PostgreSQL (Neon-compatible).

## Database inspection from the uploaded SQLite file

The supplied database contains 319 learners, 12 teachers, 13 login accounts (1 Administrator and 12 Teachers), 5 assessments, 4,484 score records, 55 teacher learning-area assignments and 6 class-teacher assignments. The original database is not included in this source ZIP.

## 1. Configure PostgreSQL

Create a PostgreSQL database (Neon is suitable for Vercel). Copy `.env.example` to `.env.local` and set:

- `DATABASE_URL`: PostgreSQL connection string
- `AUTH_SECRET`: a long random secret (at least 32 random bytes)

Do not commit `.env.local`.

## 2. Install and create tables

```bash
npm install
npm install better-sqlite3
npm install -D @types/better-sqlite3
npx prisma generate
npx prisma db push
```

## 3. Import the existing database

Copy your `cbe_pms.db` file into the project root (do not commit it), then run:

```bash
npm run db:migrate:sqlite -- ./cbe_pms.db
```

The migration preserves the existing user password hashes. On first successful login, a legacy SHA-256 password hash is upgraded to a salted scrypt hash. The migration deliberately does not import the old `password_display` field, which may contain plaintext passwords.

## 4. Run locally

```bash
npm run dev
```

Open http://localhost:3000.

## 5. Deploy

Push the source to a private GitHub repository, import it into Vercel, add `DATABASE_URL` and `AUTH_SECRET` as encrypted environment variables, then deploy. Run `prisma db push` and the SQLite import once against the production database before inviting users.

## Important implementation status

This is the online migration foundation, not a claim that every desktop screen has already been ported. Login, role-aware dashboard, learner and assessment listing, shared PostgreSQL models, SQLite migration, and basic score entry with UP/DOWN keyboard navigation are included. Remaining desktop workflows must be ported and tested before production use: full teacher/admin CRUD, assignment enforcement on every API, assessment analysis calculations and comparisons, all report layouts and PDF/Excel exports, deadline override controls, password reset UI, logo upload, and graduation workflows. The score-entry endpoint currently needs stricter teacher-assignment checks and should be completed before production use. Do not expose the website to teachers until those checks and the full workflow tests are complete.

## Security and data safety

- Use a private Git repository.
- Keep `.env.local` and the SQLite database out of Git.
- Do not share the production database URL or `AUTH_SECRET`.
- Take a database backup before every production migration.
- Change default or shared passwords after migration.
