-- ============================================================
-- Portfolio Database Schema — Supabase PostgreSQL
-- Run this entire file once in Supabase SQL Editor.
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── users (admin profile) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id             UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name      TEXT        NOT NULL    DEFAULT 'Your Name',
  designation    TEXT        NOT NULL    DEFAULT 'Your Title',
  email          TEXT        NOT NULL    DEFAULT 'you@example.com',
  phone          TEXT,
  location       TEXT,
  about          TEXT,
  github_url     TEXT,
  linkedin_url   TEXT,
  portfolio_url  TEXT,
  profile_image  TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── skills ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS skills (
  id          UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  skill_name  TEXT    NOT NULL,
  category    TEXT    NOT NULL,
  level       INTEGER DEFAULT 80 CHECK (level >= 0 AND level <= 100),
  icon        TEXT    DEFAULT 'fa-solid fa-code',
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── education ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS education (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  college         TEXT NOT NULL,
  degree          TEXT NOT NULL,
  specialization  TEXT,
  start_year      TEXT NOT NULL,
  end_year        TEXT,
  cgpa            TEXT,
  description     TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── experience (internships / jobs) ──────────────────────────
CREATE TABLE IF NOT EXISTS experience (
  id               UUID  PRIMARY KEY DEFAULT uuid_generate_v4(),
  company          TEXT  NOT NULL,
  role             TEXT  NOT NULL,
  description      TEXT,
  start_date       TEXT  NOT NULL,
  end_date         TEXT,
  location         TEXT,
  logo_url         TEXT,
  technologies     TEXT[],
  responsibilities TEXT[],
  achievements     TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── projects ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id           UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  title        TEXT    NOT NULL,
  description  TEXT,
  technologies TEXT[],
  github_link  TEXT,
  live_link    TEXT,
  image        TEXT,
  featured     BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── certificates ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS certificates (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title             TEXT NOT NULL,
  issuer            TEXT NOT NULL,
  issue_date        TEXT,
  credential_id     TEXT,
  certificate_url   TEXT,
  certificate_image TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ── achievements ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS achievements (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── contact_messages ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contact_messages (
  id         UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT    NOT NULL,
  email      TEXT    NOT NULL,
  subject    TEXT,
  message    TEXT    NOT NULL,
  is_read    BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── social_links ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS social_links (
  id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform TEXT NOT NULL UNIQUE,
  url      TEXT NOT NULL
);

-- ── resume ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS resume (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resume_file TEXT NOT NULL,
  file_name   TEXT,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
ALTER TABLE users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills            ENABLE ROW LEVEL SECURITY;
ALTER TABLE education         ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience        ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects          ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates      ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements      ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages  ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_links      ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume            ENABLE ROW LEVEL SECURITY;

-- Public READ policies (anyone can view portfolio data)
CREATE POLICY "public_read_users"       ON users           FOR SELECT USING (true);
CREATE POLICY "public_read_skills"      ON skills          FOR SELECT USING (true);
CREATE POLICY "public_read_education"   ON education       FOR SELECT USING (true);
CREATE POLICY "public_read_experience"  ON experience      FOR SELECT USING (true);
CREATE POLICY "public_read_projects"    ON projects        FOR SELECT USING (true);
CREATE POLICY "public_read_certs"       ON certificates    FOR SELECT USING (true);
CREATE POLICY "public_read_achieve"     ON achievements    FOR SELECT USING (true);
CREATE POLICY "public_read_social"      ON social_links    FOR SELECT USING (true);
CREATE POLICY "public_read_resume"      ON resume          FOR SELECT USING (true);

-- Authenticated (admin) ALL policies (service_role bypasses RLS anyway)
CREATE POLICY "auth_all_users"       ON users           FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_all_skills"      ON skills          FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_all_education"   ON education       FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_all_experience"  ON experience      FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_all_projects"    ON projects        FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_all_certs"       ON certificates    FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_all_achieve"     ON achievements    FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_all_contact"     ON contact_messages FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_all_social"      ON social_links    FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_all_resume"      ON resume          FOR ALL USING (auth.role() = 'authenticated');

-- Visitors can INSERT contact messages (no auth needed)
CREATE POLICY "public_insert_contact" ON contact_messages FOR INSERT WITH CHECK (true);

-- ============================================================
-- Storage Buckets (run in Supabase Dashboard → Storage, or via SQL)
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('portfolio-images', 'portfolio-images', true) ON CONFLICT DO NOTHING;
-- INSERT INTO storage.buckets (id, name, public) VALUES ('portfolio-resume', 'portfolio-resume', true)  ON CONFLICT DO NOTHING;

-- ============================================================
-- Seed: default profile row (runs only if table is empty)
-- ============================================================
INSERT INTO users (full_name, designation, email, phone, location, about, github_url, linkedin_url)
SELECT
  'Narasimman R',
  'Software Developer | Java Developer | Python Developer | AI & ML Enthusiast',
  'narasimman.r@example.com',
  '+91 98765 43210',
  'Coimbatore, Tamil Nadu, India',
  'I''m a final-year Artificial Intelligence and Data Science Engineering student who enjoys building software that is technically sound and genuinely useful. My core strengths are Java and Python, and I''m deeply curious about applying machine learning to real-world problems.',
  'https://github.com',
  'https://www.linkedin.com'
WHERE NOT EXISTS (SELECT 1 FROM users);

-- ============================================================
-- Seed: default skills
-- ============================================================
INSERT INTO skills (skill_name, category, level, icon, sort_order)
SELECT * FROM (VALUES
  ('Java',       'Languages',  88, 'fa-brands fa-java',   0),
  ('Python',     'Languages',  92, 'fa-brands fa-python', 1),
  ('React',      'Frameworks', 80, 'fa-brands fa-react',  2),
  ('TensorFlow', 'AI / ML',    75, 'fa-solid fa-brain',   3)
) AS v(skill_name, category, level, icon, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM skills);

-- ============================================================
-- Seed: default education
-- ============================================================
INSERT INTO education (college, degree, specialization, start_year, end_year, cgpa, description)
SELECT * FROM (VALUES
  ('XYZ Institute of Engineering', 'B.Tech', 'Artificial Intelligence & Data Science', '2022', '2026', '8.6 CGPA', 'Coursework in ML, Data Structures, Distributed Systems and Statistics.'),
  ('ABC Higher Secondary School',  'HSC',    'Computer Science',                       '2020', '2022', '92%',      'Focused on Mathematics and Computer Science fundamentals.')
) AS v(college, degree, specialization, start_year, end_year, cgpa, description)
WHERE NOT EXISTS (SELECT 1 FROM education);

-- ============================================================
-- Seed: default experience
-- ============================================================
INSERT INTO experience (company, role, start_date, end_date, location, technologies, responsibilities, achievements)
SELECT
  'TechNova Solutions',
  'Software Engineering Intern',
  'Jun 2025',
  'Aug 2025',
  'Bengaluru, India (Hybrid)',
  ARRAY['Java', 'Spring Boot', 'React', 'MySQL'],
  ARRAY[
    'Developed and maintained REST APIs powering the internal analytics dashboard.',
    'Collaborated with a team of 5 engineers using Agile/Scrum methodology.',
    'Wrote unit and integration tests, raising code coverage from 62% to 85%.'
  ],
  'Received the "Best Intern" award for Q3 2025 and helped cut API response time by 30%.'
WHERE NOT EXISTS (SELECT 1 FROM experience);
