# MLSA Anonymous Feedback System

Private internal platform for **Microsoft Learn Student Ambassadors (MLSA) GIKI chapter** to collect anonymous complaints, suggestions, and event feedback.

## Scope and privacy

- MLSA internal use only
- No submitter identity fields (name, email, roll number, login) are collected
- Anonymous alias generated per submission
- Ticket + secret token based tracking
- Optional hashed request fingerprint used for anti-spam and duplicate upvote protection

## Tech stack

### Frontend

- React (Vite)
- Tailwind CSS
- React Router
- Axios
- Recharts
- Socket.IO client

### Backend

- Node.js + Express
- Prisma ORM
- PostgreSQL
- JWT admin authentication
- Helmet, CORS, rate limiting, Zod validation
- Multer + Cloudinary (optional attachment upload)
- Socket.IO for admin live updates
- Optional Discord webhook / SMTP email alerts for new complaints and suggestions

## Project structure

```text
frontend/
  src/
    components/
    hooks/
    pages/
    services/
    utils/

backend/
  prisma/
  src/
    config/
    controllers/
    middleware/
    prisma/
    routes/
    services/
    utils/
```

## Core features implemented

1. Anonymous feedback submission (complaint/suggestion/feedback)
2. Ticket tracking with secret token
3. Anonymous conversation thread on ticket
4. Admin login (JWT) and protected dashboard
5. Admin filters, status/priority updates, internal notes, replies
6. CSV export for reports
7. Analytics (monthly trend + category breakdown)
8. Public suggestions board with upvotes and anonymous comments
9. AI moderation scaffold service for future extensibility
10. Security hardening middleware and upload validation

## Database (Neon PostgreSQL)

The schema lives in `backend/prisma/schema.prisma`. Migrations are in `backend/prisma/migrations/`.

### 1. Create a Neon project

1. Sign in at [https://neon.tech](https://neon.tech) and create a project (e.g. `mlsa-feedback`).
2. Open **Dashboard → your project → Connect**.
3. Copy **both** connection strings:
   - **Pooled connection** → `DATABASE_URL` (hostname includes `-pooler`)
   - **Direct connection** → `DIRECT_URL` (used only by Prisma Migrate)

### 2. Configure and migrate

```bash
cd backend
cp .env.example .env
# Paste your Neon DATABASE_URL and DIRECT_URL into .env
npm install
npx prisma generate
npm run db:deploy
npm run dev
```

`npm run db:deploy` applies migrations to Neon. For local schema changes during development, use `npm run prisma:migrate` instead.

Backend runs on `http://localhost:5000`.

### Required environment variables

See `backend/.env.example`.

Important values:

- `DATABASE_URL` (Neon pooled connection)
- `DIRECT_URL` (Neon direct connection, for migrations)
- `JWT_SECRET`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `CORS_ORIGIN`
- Cloudinary keys (if attachments enabled)
- Optional admin alerts: `DISCORD_WEBHOOK_URL` and/or SMTP + `ADMIN_NOTIFY_EMAIL` (see `backend/.env.example`)

## Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

## API overview

### Public

- `POST /api/public/feedback`
- `GET /api/public/track/:ticketId?token=...`
- `POST /api/public/track/:ticketId/messages`
- `GET /api/public/suggestions`
- `POST /api/public/suggestions/:id/upvote`
- `POST /api/public/suggestions/:id/comments`

### Admin

- `POST /api/admin/auth/login`
- `GET /api/admin/feedback`
- `GET /api/admin/feedback/:id`
- `PATCH /api/admin/feedback/:id`
- `POST /api/admin/feedback/:id/messages`
- `GET /api/admin/analytics`
- `GET /api/admin/export/csv`

## Security controls

- `helmet` for secure HTTP headers
- strict CORS origin
- endpoint rate limiting (including dedicated limits on ticket tracking)
- Zod request validation
- upload type and size validation
- JWT auth for admin endpoints and Socket.IO live updates
- production env validation (rejects weak default secrets)
- no PII fields in data model

Run backend tests:

```bash
cd backend
npm test
```

## AI moderation scaffold

The backend includes `moderation.service.js` with hook points for:

- toxicity detection
- spam scoring
- sentiment analysis
- duplicate grouping

You can replace scaffold logic with an external AI moderation provider later.

## Deployment

Free-tier stack: **Neon** (DB) + **Fly.io** (API) + **Vercel** (frontend). Alternatives: Koyeb, Cloudflare Pages — see **[docs/DEPLOY.md](docs/DEPLOY.md)**.

Quick API deploy: `cd backend && fly launch && fly secrets set ... && fly deploy`
