# Portfolio CMS — Node.js + Express + Supabase + React

A fully dynamic portfolio website. All data is stored in Supabase PostgreSQL and served via a Node/Express REST API. The React frontend fetches everything from the backend — **zero localStorage, zero hardcoded data**.

---

## Project Structure

```
portfolio-crud/
├── backend/
│   ├── src/
│   │   ├── config/         supabase.js
│   │   ├── controllers/    one file per resource
│   │   ├── middleware/      auth.js, rateLimiter.js, validate.js
│   │   ├── routes/          one file per resource
│   │   ├── utils/           supabaseStorage.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/            axios.js, index.js
│   │   ├── components/
│   │   │   ├── sections/   ProfileSection, ResumeSection, SkillsSection,
│   │   │   │               EducationSection, ExperienceSection, ProjectsSection,
│   │   │   │               CertificatesSection, ContactSection, Nav, Footer
│   │   │   └── ui/         index.jsx (Modal, Field, Input, ImageDrop…),
│   │   │                   AdminPasswordDialog.jsx
│   │   ├── context/        AuthContext.jsx
│   │   ├── hooks/          usePortfolioData.js
│   │   ├── pages/          AdminMessages.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── database/
│   └── schema.sql          Complete Supabase schema + RLS policies + seed data
│
└── README.md
```

---

## Quick Start (Local Development)

### 1. Supabase Setup

1. Go to [supabase.com](https://supabase.com) → New project.
2. Open **SQL Editor** → paste the entire contents of `database/schema.sql` → Run.
3. Go to **Authentication → Users** → Add a new user with your admin email/password.
4. Go to **Storage** → Create two public buckets:
   - `portfolio-images`
   - `portfolio-resume`
5. Copy your **Project URL**, **anon key**, and **service_role key** from Project Settings → API.

### 2. Backend

```bash
cd backend
cp .env.example .env
# Fill in .env with your Supabase keys, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm install
npm run dev
# Runs on http://localhost:5000
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env
# VITE_API_URL=http://localhost:5000
npm install
npm run dev
# Runs on http://localhost:5173
```

---

## API Reference

| Method | Route                          | Auth    | Description               |
|--------|--------------------------------|---------|---------------------------|
| POST   | /api/auth/login                | Public  | Login → returns JWT       |
| POST   | /api/auth/logout               | Public  | Logout (client-side)      |
| GET    | /api/auth/me                   | Admin   | Get current user          |
| GET    | /api/profile                   | Public  | Get profile               |
| PUT    | /api/profile                   | Admin   | Update profile            |
| POST   | /api/profile/image             | Admin   | Upload profile photo      |
| GET    | /api/skills                    | Public  | List skills               |
| POST   | /api/skills                    | Admin   | Create skill              |
| PUT    | /api/skills/reorder            | Admin   | Reorder skills            |
| PUT    | /api/skills/:id                | Admin   | Update skill              |
| DELETE | /api/skills/:id                | Admin   | Delete skill              |
| GET    | /api/education                 | Public  | List education            |
| POST   | /api/education                 | Admin   | Create education          |
| PUT    | /api/education/:id             | Admin   | Update education          |
| DELETE | /api/education/:id             | Admin   | Delete education          |
| GET    | /api/experience                | Public  | List experience           |
| POST   | /api/experience                | Admin   | Create experience         |
| PUT    | /api/experience/:id            | Admin   | Update experience         |
| DELETE | /api/experience/:id            | Admin   | Delete experience         |
| POST   | /api/experience/:id/logo       | Admin   | Upload company logo       |
| GET    | /api/projects                  | Public  | List projects             |
| POST   | /api/projects                  | Admin   | Create project            |
| PUT    | /api/projects/:id              | Admin   | Update project            |
| DELETE | /api/projects/:id              | Admin   | Delete project            |
| POST   | /api/projects/:id/image        | Admin   | Upload project image      |
| GET    | /api/certificates              | Public  | List certificates         |
| POST   | /api/certificates              | Admin   | Create certificate        |
| PUT    | /api/certificates/:id          | Admin   | Update certificate        |
| DELETE | /api/certificates/:id          | Admin   | Delete certificate        |
| POST   | /api/certificates/:id/image    | Admin   | Upload certificate image  |
| GET    | /api/resume                    | Public  | Get resume info           |
| POST   | /api/resume                    | Admin   | Upload resume PDF         |
| DELETE | /api/resume                    | Admin   | Delete resume             |
| POST   | /api/contact                   | Public  | Submit contact form       |
| GET    | /api/contact                   | Admin   | View all messages         |
| PATCH  | /api/contact/:id/read          | Admin   | Mark message as read      |
| DELETE | /api/contact/:id               | Admin   | Delete message            |

---

## Deployment

### Backend → Render

1. Push the `backend/` folder to a GitHub repo.
2. Go to [render.com](https://render.com) → **New Web Service** → connect your repo.
3. Build command: `npm install`
4. Start command: `npm start`
5. Add all environment variables from `.env.example` in the Render dashboard.
6. Copy the live URL (e.g. `https://portfolio-api.onrender.com`).

### Frontend → Netlify

1. Push the `frontend/` folder to GitHub.
2. Go to [netlify.com](https://netlify.com) → **Add new site** → connect repo.
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add environment variable: `VITE_API_URL=https://portfolio-api.onrender.com`
6. Add to Render's `ALLOWED_ORIGINS`: your Netlify URL.

### Database → Supabase (already hosted)

No deployment needed — Supabase is cloud-native.

---

## Security Features

- JWT authentication with configurable expiry
- bcrypt password hashing (via Supabase Auth)
- Rate limiting: 100 req/15 min global, 10 req/15 min auth, 5 req/hour contact
- Helmet.js security headers
- CORS restricted to allowed origins
- XSS sanitisation on contact form
- Row Level Security (RLS) on all Supabase tables
- Input validation via express-validator

---

## Admin Workflow

1. Open your portfolio on any device.
2. Click **Admin: OFF** button (bottom-left).
3. Enter your admin email + password.
4. A JWT is issued and stored in `localStorage`.
5. Edit buttons appear on every section.
6. Changes save to Supabase instantly — visible on all devices immediately.
7. Admin auto-logs out after 15 min of inactivity.
8. Click the envelope icon in the footer to view contact form submissions.
