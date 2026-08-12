// Vercel serverless entry point — wraps the Express app
require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');

const { apiLimiter } = require('../src/middleware/rateLimiter');

// ── Route imports ──────────────────────────────────────────────────────────
const authRoutes         = require('../src/routes/auth');
const profileRoutes      = require('../src/routes/profile');
const skillsRoutes       = require('../src/routes/skills');
const educationRoutes    = require('../src/routes/education');
const experienceRoutes   = require('../src/routes/experience');
const projectsRoutes     = require('../src/routes/projects');
const certificatesRoutes = require('../src/routes/certificates');
const resumeRoutes       = require('../src/routes/resume');
const contactRoutes      = require('../src/routes/contact');
const achievementsRoutes = require('../src/routes/achievements');
const socialLinksRoutes  = require('../src/routes/socialLinks');

const app = express();

// ── Security ───────────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));

// ── CORS ───────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '*').split(',').map(o => o.trim());
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin))
      return cb(null, true);
    cb(new Error(`Origin ${origin} not allowed`));
  },
  credentials: true,
}));

// ── Body parsing ───────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Rate limiter ───────────────────────────────────────────────────────────
app.use('/api', apiLimiter);

// ── Health ─────────────────────────────────────────────────────────────────
app.get('/health', (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth',         authRoutes);
app.use('/api/profile',      profileRoutes);
app.use('/api/skills',       skillsRoutes);
app.use('/api/education',    educationRoutes);
app.use('/api/experience',   experienceRoutes);
app.use('/api/projects',     projectsRoutes);
app.use('/api/certificates', certificatesRoutes);
app.use('/api/resume',       resumeRoutes);
app.use('/api/contact',      contactRoutes);
app.use('/api/achievements', achievementsRoutes);
app.use('/api/social-links', socialLinksRoutes);

// ── 404 ────────────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: `${req.method} ${req.path} not found.` }));

// ── Error handler ──────────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ error: 'Internal server error.' });
});

// Export for Vercel serverless
module.exports = app;
