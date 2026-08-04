/**
 * run-schema.js — Auto-connect to Supabase PostgreSQL and create all tables.
 * Run: node scripts/run-schema.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Client } = require('pg');

const projectRef = process.env.SUPABASE_URL
  .replace('https://', '')
  .replace('.supabase.co', '');

const pwd = encodeURIComponent(process.env.SUPABASE_DB_PASSWORD || '');

// All possible Supabase connection strings (tries each one)
const CONNECTION_STRINGS = [
  `postgresql://postgres:${pwd}@db.${projectRef}.supabase.co:5432/postgres`,
  `postgresql://postgres.${projectRef}:${pwd}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres.${projectRef}:${pwd}@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres`,
  `postgresql://postgres.${projectRef}:${pwd}@ap-southeast-1.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres:${pwd}@${projectRef}.supabase.co:5432/postgres`,
];

// ── SQL statements ───────────────────────────────────────────────────────
const STATEMENTS = [
  `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`,

  `CREATE TABLE IF NOT EXISTS users (
    id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name     TEXT        NOT NULL DEFAULT 'Your Name',
    designation   TEXT        NOT NULL DEFAULT 'Your Title',
    email         TEXT        NOT NULL DEFAULT 'you@example.com',
    phone         TEXT,
    location      TEXT,
    about         TEXT,
    github_url    TEXT,
    linkedin_url  TEXT,
    portfolio_url TEXT,
    profile_image TEXT,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
  )`,

  `CREATE TABLE IF NOT EXISTS skills (
    id         UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
    skill_name TEXT    NOT NULL,
    category   TEXT    NOT NULL,
    level      INTEGER DEFAULT 80 CHECK (level >= 0 AND level <= 100),
    icon       TEXT    DEFAULT 'fa-solid fa-code',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  `CREATE TABLE IF NOT EXISTS education (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    college        TEXT NOT NULL,
    degree         TEXT NOT NULL,
    specialization TEXT,
    start_year     TEXT NOT NULL,
    end_year       TEXT,
    cgpa           TEXT,
    description    TEXT,
    created_at     TIMESTAMPTZ DEFAULT NOW()
  )`,

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

  `CREATE TABLE IF NOT EXISTS achievements (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title       TEXT NOT NULL,
    description TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
  )`,

  `CREATE TABLE IF NOT EXISTS contact_messages (
    id         UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
    name       TEXT    NOT NULL,
    email      TEXT    NOT NULL,
    subject    TEXT,
    message    TEXT    NOT NULL,
    is_read    BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  `CREATE TABLE IF NOT EXISTS social_links (
    id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform TEXT NOT NULL UNIQUE,
    url      TEXT NOT NULL
  )`,

  `CREATE TABLE IF NOT EXISTS resume (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resume_file TEXT NOT NULL,
    file_name   TEXT,
    updated_at  TIMESTAMPTZ DEFAULT NOW()
  )`,

  // RLS
  `ALTER TABLE users            ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE skills           ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE education        ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE experience       ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE projects         ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE certificates     ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE achievements     ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE social_links     ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE resume           ENABLE ROW LEVEL SECURITY`,

  // RLS Policies (idempotent)
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='pub_read_users'    AND tablename='users')           THEN CREATE POLICY pub_read_users    ON users           FOR SELECT USING (true); END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='pub_read_skills'   AND tablename='skills')          THEN CREATE POLICY pub_read_skills   ON skills          FOR SELECT USING (true); END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='pub_read_edu'      AND tablename='education')       THEN CREATE POLICY pub_read_edu      ON education       FOR SELECT USING (true); END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='pub_read_exp'      AND tablename='experience')      THEN CREATE POLICY pub_read_exp      ON experience      FOR SELECT USING (true); END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='pub_read_proj'     AND tablename='projects')        THEN CREATE POLICY pub_read_proj     ON projects        FOR SELECT USING (true); END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='pub_read_certs'    AND tablename='certificates')    THEN CREATE POLICY pub_read_certs    ON certificates    FOR SELECT USING (true); END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='pub_read_achieve'  AND tablename='achievements')    THEN CREATE POLICY pub_read_achieve  ON achievements    FOR SELECT USING (true); END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='pub_read_social'   AND tablename='social_links')    THEN CREATE POLICY pub_read_social   ON social_links    FOR SELECT USING (true); END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='pub_read_resume'   AND tablename='resume')          THEN CREATE POLICY pub_read_resume   ON resume          FOR SELECT USING (true); END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='pub_ins_contact'   AND tablename='contact_messages') THEN CREATE POLICY pub_ins_contact  ON contact_messages FOR INSERT WITH CHECK (true); END IF;
  END $$`,

  // Seed: default profile row
  `INSERT INTO users (full_name,designation,email,phone,location,about,github_url,linkedin_url)
   SELECT 'Narasimman R','Software Developer | Java Developer | Python Developer | AI & ML Enthusiast',
   'narasimman.r@example.com','+91 98765 43210','Coimbatore, Tamil Nadu, India',
   'I am a final-year Artificial Intelligence and Data Science Engineering student.',
   'https://github.com','https://www.linkedin.com'
   WHERE NOT EXISTS (SELECT 1 FROM users)`,

  // Seed: skills
  `INSERT INTO skills (skill_name,category,level,icon,sort_order)
   SELECT * FROM (VALUES
     ('Java','Languages',88,'fa-brands fa-java',0),
     ('Python','Languages',92,'fa-brands fa-python',1),
     ('React','Frameworks',80,'fa-brands fa-react',2),
     ('TensorFlow','AI / ML',75,'fa-solid fa-brain',3)
   ) v(skill_name,category,level,icon,sort_order)
   WHERE NOT EXISTS (SELECT 1 FROM skills)`,

  // Seed: education
  `INSERT INTO education (college,degree,specialization,start_year,end_year,cgpa,description)
   SELECT * FROM (VALUES
     ('XYZ Institute of Engineering','B.Tech','AI & Data Science','2022','2026','8.6 CGPA','Coursework in ML, Data Structures, Distributed Systems.'),
     ('ABC Higher Secondary School','HSC','Computer Science','2020','2022','92%','Mathematics and Computer Science fundamentals.')
   ) v(college,degree,specialization,start_year,end_year,cgpa,description)
   WHERE NOT EXISTS (SELECT 1 FROM education)`,

  // Seed: experience
  `INSERT INTO experience (company,role,start_date,end_date,location,technologies,responsibilities,achievements)
   SELECT 'TechNova Solutions','Software Engineering Intern','Jun 2025','Aug 2025','Bengaluru, India (Hybrid)',
   ARRAY['Java','Spring Boot','React','MySQL'],
   ARRAY['Developed REST APIs for analytics dashboard.','Worked in Agile/Scrum team of 5 engineers.','Raised test coverage from 62% to 85%.'],
   'Received Best Intern award Q3 2025. Cut API response time by 30%.'
   WHERE NOT EXISTS (SELECT 1 FROM experience)`,
];

// ── Try each connection string ────────────────────────────────────────────
async function tryConnect(connStr) {
  const client = new Client({ connectionString: connStr, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 8000 });
  await client.connect();
  return client;
}

async function main() {
  console.log('\n🚀  Portfolio Database Setup');
  console.log(`📡  Project: ${projectRef}`);
  console.log(`🔑  DB Password: ${process.env.SUPABASE_DB_PASSWORD ? '✅ Set' : '❌ Missing'}\n`);

  let client = null;

  // Try each connection string
  for (let i = 0; i < CONNECTION_STRINGS.length; i++) {
    const cs = CONNECTION_STRINGS[i];
    const displayCs = cs.replace(pwd, '***');
    process.stdout.write(`  Trying [${i+1}/${CONNECTION_STRINGS.length}]: ${displayCs.substring(0, 70)}... `);
    try {
      client = await tryConnect(cs);
      console.log('✅ Connected!');
      break;
    } catch (err) {
      console.log(`❌ ${err.message.substring(0, 50)}`);
    }
  }

  if (!client) {
    console.log('\n❌  All connection attempts failed.\n');
    console.log('📋  MANUAL STEPS (2 minutes):');
    console.log(`    1. Open: https://supabase.com/dashboard/project/${projectRef}/sql/new`);
    console.log('    2. Copy contents of: database/schema.sql');
    console.log('    3. Paste and click Run');
    console.log(`\n    OR reset your DB password at:`);
    console.log(`    https://supabase.com/dashboard/project/${projectRef}/settings/database`);
    console.log('    Then update SUPABASE_DB_PASSWORD in backend/.env\n');
    process.exit(1);
  }

  console.log('\n📋  Creating tables & seeding data...\n');
  let ok = 0, skip = 0, fail = 0;

  for (let i = 0; i < STATEMENTS.length; i++) {
    const stmt = STATEMENTS[i];
    const label = stmt.trim().replace(/\s+/g, ' ').substring(0, 55);
    try {
      await client.query(stmt);
      console.log(`  ✅  ${label}`);
      ok++;
    } catch (err) {
      if (err.message.includes('already exists') || err.message.includes('duplicate')) {
        console.log(`  ⏭️   ${label} (already exists)`);
        skip++;
      } else {
        console.log(`  ⚠️   ${label}`);
        console.log(`       → ${err.message.substring(0, 80)}`);
        fail++;
      }
    }
  }

  // Final table list
  const { rows } = await client.query(
    `SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name`
  );
  console.log('\n📊  Tables in your database:');
  rows.forEach(r => console.log(`  ✅  ${r.table_name}`));

  await client.end();

  console.log(`\n🎉  Done! (${ok} created, ${skip} skipped, ${fail} warnings)`);
  console.log('\n▶️   Start your servers:');
  console.log('    Backend  → npm run dev  (in backend folder)');
  console.log('    Frontend → npm run dev  (in frontend folder)');
  console.log('\n🌐  Open: http://localhost:5173');
  console.log('🔐  Admin login: narasimman@portfolio.com / Narasimman@2005\n');
}

main().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
