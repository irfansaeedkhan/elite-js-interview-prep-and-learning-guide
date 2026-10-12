# Chronos — Deploy to Vercel + Neon (step-by-step)

> For someone who has never deployed a full-stack app before.  
> **Good news:** Chronos has no separate backend server. Next.js + Hono run together on Vercel automatically.

---

## How it works (simple mental model)

```
┌─────────────────────────────────────────────────────────┐
│  VERCEL (hosts your app)                                │
│                                                         │
│  User visits chronos.vercel.app                         │
│       │                                                 │
│       ├── /login, /planner  →  Next.js pages (UI)     │
│       ├── /api/auth/*         →  Better Auth (login)    │
│       └── /api/tasks/* etc.   →  Hono API (your data)   │
│                                                         │
│  All of this is ONE Next.js project — no second server. │
└─────────────────────────────────────────────────────────┘
                          │
                          │ DATABASE_URL (connection string)
                          ▼
┌─────────────────────────────────────────────────────────┐
│  NEON (hosts your Postgres database in the cloud)       │
│                                                         │
│  Tables: user, session, tasks, hour_logs, etc.          │
│  Same as local Docker Postgres — just managed for you.  │
└─────────────────────────────────────────────────────────┘
```

**Neon** = managed PostgreSQL in the cloud. Free tier: 0.5 GB storage, enough for beta.  
You get a **connection string** (like a passworded URL). Your app uses it via `DATABASE_URL`.

**Vercel** = hosts the Next.js app. When someone hits `/api/tasks`, Vercel runs your Hono code as a serverless function.

---

## Part 1 — Neon database (~10 minutes)

### 1. Create account
1. Go to [https://neon.tech](https://neon.tech)
2. Sign up (GitHub login is fine)

### 2. Create a project
1. Click **New Project**
2. Name: `chronos`
3. Region: pick closest to you (e.g. `AWS Asia Pacific (Singapore)` or `US East`)
4. Postgres version: **16** (matches local Docker)
5. Click **Create**

### 3. Copy connection strings
Neon shows two URLs on the dashboard:

| String | Use for |
|---|---|
| **Pooled connection** | `DATABASE_URL` on **Vercel** (serverless — use this one) |
| **Direct connection** | Local `drizzle-kit push` from your machine |

The pooled URL looks like:
```
postgresql://user:password@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require
```

Save both — you'll need them.

### 4. Push your schema to Neon (from your laptop)

In terminal, from the `chronos` folder:

```bash
# Temporarily point at Neon (direct connection string, NOT pooler)
DATABASE_URL="postgresql://..." yarn db:push --force
```

This creates all tables (`user`, `session`, `tasks`, `hour_logs`, etc.) on Neon — same as you did with Docker locally.

> **Tip:** You can add a second line to `.env.local` commented as `# NEON_DIRECT_URL=...` for deploy prep. Never commit real URLs to git.

---

## Part 2 — Vercel project (~15 minutes)

### 1. Push code to GitHub
Vercel deploys from Git. If `chronos` isn't on GitHub yet:

```bash
cd flow-horizon-app
git add chronos/
git commit -m "Chronos app ready for deploy"
git push
```

(Or create a repo with only the `chronos` folder.)

### 2. Import project in Vercel
1. Go to [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. **Add New → Project**
3. Import your GitHub repository
4. **Important:** set **Root Directory** to `chronos` (if repo contains more than chronos)
5. Framework: **Next.js** (auto-detected)
6. Build command: `yarn build` (default)
7. Install command: `yarn install`

**Do not deploy yet** — add env vars first.

---

## Part 3 — Environment variables on Vercel

In Vercel → your project → **Settings → Environment Variables**

Add each variable for **Production** (and Preview if you want staging):

| Variable | Value | Notes |
|---|---|---|
| `DATABASE_URL` | Neon **pooled** connection string | Required |
| `BETTER_AUTH_SECRET` | New secret: `openssl rand -base64 32` | **Different from local** — generate fresh |
| `BETTER_AUTH_URL` | `https://day-mirror-mocha.vercel.app` | Your live URL (custom domain later). On Vercel, the app also auto-detects `VERCEL_URL` at runtime if this is wrong. |
| `GOOGLE_CLIENT_ID` | Same as local | From Google Console |
| `GOOGLE_CLIENT_SECRET` | Same as local | From Google Console |
| `NODE_ENV` | `production` | Usually auto-set by Vercel |

**Do NOT add** on production:
- `DEV_USER_ID`
- `NEXT_PUBLIC_DEV_USER_ID`

Those are local-only dev shortcuts.

### After first deploy — update URLs

Once Vercel gives you a URL (e.g. `https://chronos-abc123.vercel.app`):

1. Update `BETTER_AUTH_URL` in Vercel to that exact URL
2. **Redeploy** (Deployments → ⋯ → Redeploy)

---

## Part 4 — Google OAuth for production

In [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials), add to the **same** OAuth client:

**Authorized JavaScript origins:**
```
https://your-app.vercel.app
```

**Authorized redirect URIs:**
```
https://your-app.vercel.app/api/auth/callback/google
```

Keep localhost entries too if you still develop locally.

See `OAUTH-SETUP.md` for details.

---

## Part 5 — Deploy

1. Vercel → **Deployments → Deploy** (or push to GitHub — auto-deploys)
2. Wait for build (~2 min)
3. Open your URL
4. Test: sign up with Google → create a task → refresh → data persists

---

## Part 6 — Verify production

| Check | How |
|---|---|
| Health | Visit `https://your-app.vercel.app/api/health` → `{ "data": { "status": "ok" } }` |
| Auth | `https://your-app.vercel.app/api/auth/ok` → `{ "status": "ok" }` |
| Login | Google sign-in works |
| Data isolation | Two accounts see different tasks |
| HTTPS cookies | Auth works after login (session persists) |

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Build fails on env | All required vars set? `BETTER_AUTH_SECRET`, `DATABASE_URL`, `BETTER_AUTH_URL` |
| `DATABASE_URL is not set` | Add pooled Neon URL in Vercel env, redeploy |
| Google `redirect_uri_mismatch` | `BETTER_AUTH_URL` must be your **real** Vercel URL (check Deployments tab). Google redirect URI must match `{BETTER_AUTH_URL}/api/auth/callback/google`. Redeploy after env change. |
| `Invalid origin` / auth 403 | `BETTER_AUTH_URL` does not match browser URL — fix env and redeploy |
| Login works but API 401 | `BETTER_AUTH_URL` must match site URL exactly; cookies need same domain |
| DB connection errors | Use **pooled** URL on Vercel, not direct |
| Tables missing | Run `yarn db:push` against Neon direct URL from local machine |

---

## Cost summary

| Service | Free tier |
|---|---|
| Vercel Hobby | Free for personal projects |
| Neon | Free — 0.5 GB, 1 project |
| Google OAuth | Free |
| **Total** | **$0/month** for beta |

Optional later: custom domain ~$12/year.

---

## Local vs production

| | Local | Production |
|---|---|---|
| Database | Docker Postgres (`yarn db:up`) | Neon cloud |
| App URL | `http://localhost:3000` | `https://xxx.vercel.app` |
| Auth secret | `.env.local` | Vercel env vars |
| Schema changes | `yarn db:push` | Same command, point `DATABASE_URL` at Neon |

---

## Next after deploy

- [ ] Custom domain (when ready)
- [ ] Sentry for error tracking (free tier)
- [ ] Vercel Analytics
- [ ] Landing page (Phase 3 in ROADMAP.md)
