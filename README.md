# Portfolio CMS — React + Node.js + Supabase

A fully dynamic portfolio website. All data is stored in Supabase PostgreSQL. The React frontend connects directly via Supabase JS client — **zero localStorage, zero hardcoded data**.

---

## Project Structure

```
portfolio/
├── backend/
│   ├── api/
│   │   └── index.js        Vercel serverless entry point
│   ├── src/
│   │   ├── config/         supabase.js
│   │   ├── controllers/    one file per resource
│   │   ├── middleware/     auth.js, rateLimiter.js, validate.js
│   │   ├── routes/         one file per resource
│   │   ├── utils/          supabaseStorage.js
│   │   └── server.js       Express app (local dev)
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── sections/   ProfileSection, ResumeSection, SkillsSection,
│   │   │   │               EducationSection, ExperienceSection, ProjectsSection,
│   │   │   │               CertificatesSection, AchievementsSection,
│   │   │   │               ContactSection, Nav, Footer
│   │   │   └── ui/         index.jsx (Modal, Field, Input, ImageDrop…),
│   │   │                   AdminPasswordDialog.jsx
│   │   ├── context/        AuthContext.jsx
│   │   ├── hooks/          usePortfolioData.js + per-resource hooks
│   │   ├── services/       per-resource Supabase service files
│   │   ├── lib/            supabase.js
│   │   ├── pages/          AdminMessages.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── database/
│   └── schema.sql          Supabase schema + RLS policies
│
├── vercel.json             Vercel deployment config
├── render.yaml             Render deployment config
└── README.md
```

---

## Quick Start (Local Development)

### 1. Supabase Setup

1. Go to [supabase.com](https://supabase.com) → New project.
2. Open **SQL Editor** → paste contents of `database/schema.sql` → Run.
3. Go to **Authentication → Users** → Add admin user.
4. Go to **Storage** → Create two public buckets: `portfolio-images`, `portfolio-resume`.
5. Copy **Project URL**, **anon key**, **service_role key** from Project Settings → API.

### 2. Backend (local)

```bash
cd backend
cp .env.example .env
# Fill .env with Supabase keys, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm install
npm run dev          # http://localhost:5000
```

### 3. Frontend (local)

```bash
cd frontend
cp .env.example .env
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_ANON_KEY=...
# VITE_API_URL=http://localhost:5000
# VITE_ADMIN_EMAIL=...
npm install
npm run dev          # http://localhost:5173
```

---

## Deployment → Vercel

Both frontend and backend deploy together from the root using `vercel.json`.

### Steps

1. Push this repo to GitHub.
2. Go to [vercel.com](https://vercel.com) → **New Project** → import repo.
3. **Root Directory** → leave blank (vercel.json is at root).
4. Add Environment Variables:

| Key | Value |
|-----|-------|
| `VITE_SUPABASE_URL` | your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | your Supabase anon key |
| `VITE_API_URL` | your Vercel deployment URL |
| `VITE_ADMIN_EMAIL` | admin email |
| `SUPABASE_URL` | your Supabase project URL |
| `SUPABASE_ANON_KEY` | your Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | your service role key |
| `JWT_SECRET` | any strong random string |
| `ALLOWED_ORIGINS` | your Vercel URL |

5. Click **Deploy**. ✅

---

## Security Features

- SHA-256 password verification (client-side, never stored)
- Supabase Auth + JWT for write operations
- Row Level Security (RLS) on all Supabase tables
- Rate limiting: 100 req/15 min global
- Helmet.js security headers
- CORS restricted to allowed origins
- XSS sanitisation on contact form
- Admin auto-logout after 15 min inactivity

---

## Admin Workflow

1. Open your portfolio.
2. Click **Admin: OFF** button (bottom-left).
3. Enter admin password → verified via SHA-256.
4. Edit buttons appear on every section.
5. Changes save to Supabase instantly — visible everywhere.
6. Auto-logout after 15 min inactivity.
