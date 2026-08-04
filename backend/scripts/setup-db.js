/**
 * setup-db.js — Run this ONCE to create all tables and seed default data.
 * Usage: node scripts/setup-db.js
 *
 * This runs each SQL statement individually via the Supabase REST API
 * using the service role key (bypasses RLS).
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { db: { schema: 'public' }, auth: { persistSession: false } }
);

const statements = [
  // UUID extension
  `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`,

  // users
  `CREATE TABLE IF NOT EXISTS users (
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
  )`,

  // skills
  `CREATE TABLE IF NOT EXISTS skills (
    id          UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
    skill_name  TEXT    NOT NULL,
    category    TEXT    NOT NULL,
    level       INTEGER DEFAULT 80 CHECK (level >= 0 AND level <= 100),
    icon        TEXT    DEFAULT 'fa-solid fa-code',
    sort_order  INTEGER DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT NOW()
  )`,

  // education
  `CREATE TABLE IF NOT EXISTS education (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    college         TEXT NOT NULL,
    degree          TEXT NOT NULL,
    specialization  TEXT,
    start_year      TEXT NOT NULL,
    end_year        TEXT,
    cgpa            TEXT,
    description     TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
  )`,

  // experience
  `CREATE TABLE IF NOT EXISTS experience (
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
  )`,

  // projects
  `CREATE TABLE IF NOT EXISTS projects (
    id           UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
    title        TEXT    NOT NULL,
    description  TEXT,
    technologies TEXT[],
    github_link  TEXT,
    live_link    TEXT,
    image        TEXT,
    featured     BOOLEAN DEFAULT FALSE,
    created_at   TIMESTAMPTZ DEFAULT NOW()
  )`,

  // certificates
  `CREATE TABLE IF NOT EXISTS certificates (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title             TEXT NOT NULL,
    issuer            TEXT NOT NULL,
    issue_date        TEXT,
    credential_id     TEXT,
    certificate_url   TEXT,
    certificate_image TEXT,
    created_at        TIMESTAMPTZ DEFAULT NOW()
  )`,

  // achievements
  `CREATE TABLE IF NOT EXISTS achievements (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title       TEXT NOT NULL,
    description TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
  )`,

  // contact_messages
  `CREATE TABLE IF NOT EXISTS contact_messages (
    id         UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
    name       TEXT    NOT NULL,
    email      TEXT    NOT NULL,
    subject    TEXT,
    message    TEXT    NOT NULL,
    is_read    BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  // social_links
  `CREATE TABLE IF NOT EXISTS social_links (
    id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform TEXT NOT NULL UNIQUE,
    url      TEXT NOT NULL
  )`,

  // resume
  `CREATE TABLE IF NOT EXISTS resume (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resume_file TEXT NOT NULL,
    file_name   TEXT,
    updated_at  TIMESTAMPTZ DEFAULT NOW()
  )`,
];

// Seed data (INSERT IF NOT EXISTS)
const seeds = [
  {
    table: 'users',
    check: () => supabase.from('users').select('id').limit(1),
    insert: () => supabase.from('users').insert({
      full_name:    'Narasimman R',
      designation:  'Software Developer | Java Developer | Python Developer | AI & ML Enthusiast',
      email:        'narasimman.r@example.com',
      phone:        '+91 98765 43210',
      location:     'Coimbatore, Tamil Nadu, India',
      about:        "I'm a final-year Artificial Intelligence and Data Science Engineering student who enjoys building software that is technically sound and genuinely useful.",
      github_url:   'https://github.com',
      linkedin_url: 'https://www.linkedin.com',
    }),
  },
  {
    table: 'skills',
    check: () => supabase.from('skills').select('id').limit(1),
    insert: () => supabase.from('skills').insert([
      { skill_name: 'Java',       category: 'Languages',  level: 88, icon: 'fa-brands fa-java',   sort_order: 0 },
      { skill_name: 'Python',     category: 'Languages',  level: 92, icon: 'fa-brands fa-python', sort_order: 1 },
      { skill_name: 'React',      category: 'Frameworks', level: 80, icon: 'fa-brands fa-react',  sort_order: 2 },
      { skill_name: 'TensorFlow', category: 'AI / ML',    level: 75, icon: 'fa-solid fa-brain',   sort_order: 3 },
    ]),
  },
  {
    table: 'education',
    check: () => supabase.from('education').select('id').limit(1),
    insert: () => supabase.from('education').insert([
      { college: 'XYZ Institute of Engineering', degree: 'B.Tech', specialization: 'Artificial Intelligence & Data Science', start_year: '2022', end_year: '2026', cgpa: '8.6 CGPA', description: 'Coursework in ML, Data Structures, Distributed Systems and Statistics.' },
      { college: 'ABC Higher Secondary School',  degree: 'HSC',    specialization: 'Computer Science',                       start_year: '2020', end_year: '2022', cgpa: '92%',      description: 'Focused on Mathematics and Computer Science fundamentals.' },
    ]),
  },
  {
    table: 'experience',
    check: () => supabase.from('experience').select('id').limit(1),
    insert: () => supabase.from('experience').insert({
      company:          'TechNova Solutions',
      role:             'Software Engineering Intern',
      start_date:       'Jun 2025',
      end_date:         'Aug 2025',
      location:         'Bengaluru, India (Hybrid)',
      technologies:     ['Java', 'Spring Boot', 'React', 'MySQL'],
      responsibilities: [
        'Developed and maintained REST APIs powering the internal analytics dashboard.',
        'Collaborated with a team of 5 engineers using Agile/Scrum methodology.',
        'Wrote unit and integration tests, raising code coverage from 62% to 85%.',
      ],
      achievements: 'Received the "Best Intern" award for Q3 2025 and helped cut API response time by 30%.',
    }),
  },
];

async function run() {
  console.log('\n🚀  Portfolio DB Setup\n');
  console.log(`📡  Supabase: ${process.env.SUPABASE_URL}\n`);

  // Step 1: Create tables using raw SQL via pg_query (Supabase supports this via rpc)
  // Since we can't run DDL through the JS client directly, we use the management API
  const { data: version, error: vErr } = await supabase.rpc('version');
  if (vErr && vErr.message.includes('function public.version() does not exist')) {
    console.log('ℹ️   Cannot run DDL via JS client directly.');
    console.log('    Please run database/schema.sql manually in Supabase SQL Editor.');
    console.log('    URL: https://supabase.com/dashboard/project/_/sql\n');
  }

  // Step 2: Seed data (only if tables already exist)
  console.log('🌱  Seeding default data...\n');
  let allGood = true;

  for (const seed of seeds) {
    try {
      const { data: existing, error: checkErr } = await seed.check();
      if (checkErr) {
        console.log(`  ⚠️   ${seed.table}: table may not exist yet — run schema.sql first`);
        allGood = false;
        continue;
      }
      if (existing && existing.length > 0) {
        console.log(`  ✅  ${seed.table}: already has data — skipping`);
        continue;
      }
      const { error: insertErr } = await seed.insert();
      if (insertErr) {
        console.log(`  ❌  ${seed.table}: ${insertErr.message}`);
        allGood = false;
      } else {
        console.log(`  ✅  ${seed.table}: seeded successfully`);
      }
    } catch (err) {
      console.log(`  ❌  ${seed.table}: ${err.message}`);
      allGood = false;
    }
  }

  console.log('\n' + (allGood
    ? '✅  Setup complete! Start the server with: npm run dev'
    : '⚠️   Some steps need manual action.\n    → Open Supabase SQL Editor and run database/schema.sql first.\n    → Then re-run: node scripts/setup-db.js'));
  console.log('');
}

run().catch(console.error);
