# Deploy MLSA Feedback

Recommended stack (free tier friendly):

| Part | Service | Why |
|------|---------|-----|
| Database | [Neon](https://neon.tech) | Already configured |
| API + WebSockets | [Render](https://render.com) | Node + Socket.IO |
| Frontend | [Vercel](https://vercel.com) | Vite/React static hosting |

Deploy **backend first**, then frontend, then set `CORS_ORIGIN` on the API to match the frontend URL.

---

## 0. Prerequisites

- Git repo pushed to GitHub
- Neon `DATABASE_URL` (pooled) and `DIRECT_URL` (direct)
- Strong secrets ready (do **not** use dev defaults in production):

```bash
# Example: generate secrets locally
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 1. Deploy API on Render

### Option A — Blueprint (fastest)

1. [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**
2. Connect this repo; Render reads `render.yaml`
3. Set **secret** env vars when prompted (or after create):

| Variable | Value |
|----------|--------|
| `DATABASE_URL` | Neon **pooled** connection string |
| `DIRECT_URL` | Neon **direct** connection string |
| `ADMIN_USERNAME` | e.g. `mlsa-admin` |
| `ADMIN_PASSWORD` | Strong password (12+ chars) |
| `CORS_ORIGIN` | Temporary `http://localhost:5173` — update after step 2 |
| `JWT_SECRET` | 32+ char random string (or use Render generated) |
| `IP_HASH_SALT` | 16+ char random string (or use Render generated) |

4. Wait for deploy; note the URL, e.g. `https://mlsa-feedback-api.onrender.com`
5. Check health: `https://mlsa-feedback-api.onrender.com/health` → `{"status":"ok"}`

Build runs `npm run db:deploy` so migrations apply on each deploy.

### Option B — Manual Web Service

1. **New** → **Web Service** → connect repo
2. **Root directory:** `backend`
3. **Build command:** `npm install && npm run db:deploy`
4. **Start command:** `npm start`
5. **Health check path:** `/health`
6. Add the same env vars as above

### Render notes

- Free tier sleeps after inactivity; first request may be slow (~30s).
- `PORT` is set by Render automatically.
- Attachments need Cloudinary env vars; otherwise submissions work without files.

---

## 2. Deploy frontend on Vercel

1. [Vercel](https://vercel.com) → **Add New Project** → import repo
2. **Root directory:** `frontend`
3. **Framework preset:** Vite
4. **Environment variables:**

| Variable | Example |
|----------|---------|
| `VITE_API_URL` | `https://mlsa-feedback-api.onrender.com/api` |
| `VITE_SOCKET_URL` | `https://mlsa-feedback-api.onrender.com` |

5. Deploy; note the URL, e.g. `https://mlsa-feedback.vercel.app`

`vercel.json` rewrites all routes to `index.html` for React Router.

---

## 3. Link frontend ↔ API (CORS)

In **Render** → your API service → **Environment**:

```env
CORS_ORIGIN=https://mlsa-feedback.vercel.app
```

No trailing slash. Save → Render redeploys.

Test:

- Open the Vercel URL → submit test feedback
- `/admin/login` with your `ADMIN_USERNAME` / `ADMIN_PASSWORD`
- Dashboard live updates (Socket.IO) should work if `VITE_SOCKET_URL` matches the API host

---

## 4. Post-deploy checklist

- [ ] Rotate Neon DB password if it was ever shared in chat/commits
- [ ] Change admin password from local dev defaults
- [ ] Confirm `NODE_ENV=production` on Render
- [ ] Run `npm test` in `backend` locally before future releases
- [ ] Optional: custom domain on Vercel + update `CORS_ORIGIN`

---

## 5. Alternative hosts

| API | Frontend |
|-----|----------|
| [Railway](https://railway.app) | Vercel |
| [Fly.io](https://fly.io) | Netlify (add `_redirects`: `/* /index.html 200`) |
| Render static site | Same Render account |

Railway/Fly: use `backend` folder, `npm run db:deploy` in build, `npm start`, same env vars.

---

## 6. Troubleshooting

| Issue | Fix |
|-------|-----|
| CORS error in browser | `CORS_ORIGIN` must exactly match frontend origin (scheme + host, no path) |
| API 502 / slow wake | Render free cold start; retry or upgrade plan |
| Admin login fails | Check `ADMIN_*` env; admin is seeded on first boot if missing in DB |
| Socket not updating | `VITE_SOCKET_URL` must be API origin; JWT required (log in as admin) |
| Migrate fails on build | Verify `DIRECT_URL` (non-pooler host) in Render env |
| Attachment upload fails | Set Cloudinary vars or submit without attachment |

---

## 7. CI (optional)

GitHub Actions runs backend tests on push/PR (see `.github/workflows/ci.yml`).
