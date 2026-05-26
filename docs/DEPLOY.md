# Deploy MLSA Feedback (free tier)

Your app needs a **always-on or wakeable Node process** (Express + Socket.IO). Pure serverless (Vercel/Netlify functions) is **not** suitable for the API.

## Recommended free stack

| Part | Service | Free tier notes |
|------|---------|-----------------|
| Database | [Neon](https://neon.tech) | Generous free Postgres (you already use this) |
| **API** | **[Fly.io](https://fly.io)** | Small VM, WebSockets OK, `backend/fly.toml` included |
| **Frontend** | **[Vercel](https://vercel.com)** or **[Cloudflare Pages](https://pages.cloudflare.com)** | Static Vite build, free |

Deploy **API first** → **frontend** → set `CORS_ORIGIN` on the API.

---

## Free API alternatives (instead of Render)

| Host | Good for this app? | Free tier reality |
|------|-------------------|-------------------|
| **[Fly.io](https://fly.io)** ⭐ | Yes — WebSockets, Docker, Neon | Allowance-based; 1 small VM can run 24/7 within free credits |
| **[Koyeb](https://koyeb.com)** | Yes — Git deploy, WebSockets | 1 free **Nano** web service per account |
| **[Oracle Cloud](https://www.oracle.com/cloud/free/)** | Yes — full VPS | Always-free ARM VM; more setup (SSH, PM2/nginx) |
| **Render** | Yes | Free tier **sleeps** (~30s cold start) — fine but annoying |
| **Railway** | Yes | ~$5 trial credit, then paid — not long-term free |
| **Vercel / Netlify** (API only) | No | No persistent Socket.IO server |

**Avoid for API:** Vercel serverless, Netlify functions, Cloudflare Workers (unless you drop Socket.IO live updates).

---

## 0. Prerequisites

- Repo on GitHub
- Neon `DATABASE_URL` (pooled) + `DIRECT_URL` (direct)
- Strong production secrets (32+ char `JWT_SECRET`, 12+ char `ADMIN_PASSWORD`, unique `IP_HASH_SALT`)

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 1. Deploy API on Fly.io (recommended)

### Install CLI

- Windows: `irm https://fly.io/install.ps1 | iex`
- macOS/Linux: `curl -L https://fly.io/install.sh | sh`

**Windows: `fly` not found?** Fully **quit and reopen Cursor** so PATH reloads. Or use the repo wrapper from `backend/`:

```powershell
.\scripts\fly.ps1 version
.\scripts\fly.ps1 auth login
```

Or fix only the current terminal:

```powershell
$env:Path += ";$env:USERPROFILE\.fly\bin"
fly version
```

### Deploy

```bash
cd backend
fly auth login
fly launch --no-deploy
# Accept defaults or rename app; region e.g. iad (Virginia) — close to Neon us-east-1
```

Set secrets (paste your real values):

```bash
fly secrets set \
  DATABASE_URL="postgresql://...@ep-xxx-pooler....neon.tech/neondb?sslmode=require" \
  DIRECT_URL="postgresql://...@ep-xxx....neon.tech/neondb?sslmode=require" \
  JWT_SECRET="your-32-char-or-longer-secret" \
  ADMIN_USERNAME="mlsa-admin" \
  ADMIN_PASSWORD="your-strong-password" \
  CORS_ORIGIN="https://your-frontend.vercel.app" \
  IP_HASH_SALT="your-unique-salt"
```

Optional Cloudinary:

```bash
fly secrets set CLOUDINARY_CLOUD_NAME="..." CLOUDINARY_API_KEY="..." CLOUDINARY_API_SECRET="..."
```

Optional admin alerts when a **complaint** or **suggestion** is submitted (Discord, email, or both):

```bash
# Discord — create a webhook in your server (Integrations → Webhooks)
fly secrets set DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/..."

# Email — SMTP + one or more recipients (comma-separated)
fly secrets set \
  ADMIN_NOTIFY_EMAIL="lead@example.com,ops@example.com" \
  ADMIN_DASHBOARD_URL="https://your-app.vercel.app/admin" \
  SMTP_HOST="smtp.gmail.com" \
  SMTP_PORT="587" \
  SMTP_SECURE="false" \
  SMTP_USER="your@gmail.com" \
  SMTP_PASS="your-app-password" \
  SMTP_FROM="MLSA Feedback <your@gmail.com>"
```

Deploy:

```bash
fly deploy
fly open /health
```

API URL: `https://mlsa-feedback-api.fly.dev` (or your chosen app name).

Config files: `backend/fly.toml`, `backend/Dockerfile`.

### Fly free-tier tips

- `min_machines_running = 0` in `fly.toml` — machine **stops when idle** (saves credits); first hit wakes it (~few seconds).
- For always-on, set `min_machines_running = 1` (uses more of free allowance).
- Check usage: `fly dashboard` → **Billing**.

---

## 2. Deploy API on Koyeb (alternative, no Docker required)

1. [Koyeb](https://app.koyeb.com) → **Create App** → **GitHub** → this repo
2. **Builder:** Node.js | **Root directory:** `backend`
3. **Build:** `npm install && npm run db:deploy`
4. **Run:** `npm start`
5. **Port:** `5000` | **Health check:** `/health`
6. Add env vars (same as Fly secrets table above)
7. Deploy → URL like `https://your-app-xxx.koyeb.app`

Free **Nano** instance: one service per account; good for chapter traffic.

---

## 3. Deploy frontend (Vercel — free)

1. [vercel.com](https://vercel.com) → import repo → **Root:** `frontend`
2. Env vars:

| Variable | Example (Fly) |
|----------|-----------------|
| `VITE_API_URL` | `https://mlsa-feedback-api.fly.dev/api` |
| `VITE_SOCKET_URL` | `https://mlsa-feedback-api.fly.dev` |

3. Deploy → copy URL → update API `CORS_ORIGIN` to that URL (no trailing slash)

### Frontend on Cloudflare Pages (also free)

1. **Workers & Pages** → **Create** → connect repo
2. **Root:** `frontend` | **Build:** `npm run build` | **Output:** `dist`
3. Add same `VITE_*` env vars in **Settings → Environment variables**
4. **Redirects:** add rule `/*` → `/index.html` (SPA)

---

## 4. Link frontend ↔ API (CORS)

After you know the frontend URL:

**Fly:**

```bash
fly secrets set CORS_ORIGIN="https://your-app.vercel.app"
```

**Koyeb:** update `CORS_ORIGIN` in the app env → redeploy.

---

## 5. Verify

- [ ] `https://YOUR-API.fly.dev/health` → `{"status":"ok"}`
- [ ] Submit feedback on the live site
- [ ] Admin login + dashboard Socket.IO updates

---

## 6. Post-deploy checklist

- [ ] Rotate Neon password if it was ever exposed
- [ ] Production `ADMIN_PASSWORD` / `JWT_SECRET` (not dev defaults)
- [ ] `NODE_ENV=production` (set in Fly/Koyeb/Dockerfile)

---

## 7. Render (optional)

If you still prefer Render, use [`render.yaml`](../render.yaml) in the repo root. Expect **cold starts** on the free plan.

---

## 8. Troubleshooting

| Issue | Fix |
|-------|-----|
| CORS error | `CORS_ORIGIN` = exact frontend origin |
| Fly app won't start | `fly logs` — often missing `DATABASE_URL` / `DIRECT_URL` |
| Migrate fails | `DIRECT_URL` must be non-pooler Neon host |
| Socket dead | `VITE_SOCKET_URL` = API origin (no `/api` path) |
| Slow first request | Fly/Koyeb idle wake — normal on free tier |

---

## 9. CI

GitHub Actions runs `backend` tests on push/PR (`.github/workflows/ci.yml`).
