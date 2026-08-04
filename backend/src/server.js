require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');

const { apiLimiter } = require('./middleware/rateLimiter');

// ── Route imports ─────────────────────────────────────────────────────────
const authRoutes         = require('./routes/auth');
const profileRoutes      = require('./routes/profile');
const skillsRoutes       = require('./routes/skills');
const educationRoutes    = require('./routes/education');
const experienceRoutes   = require('./routes/experience');
const projectsRoutes     = require('./routes/projects');
const certificatesRoutes = require('./routes/certificates');
const resumeRoutes       = require('./routes/resume');
const contactRoutes      = require('./routes/contact');
const achievementsRoutes = require('./routes/achievements');
const socialLinksRoutes  = require('./routes/socialLinks');

const app = express();

// ── Security headers ──────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(',').map(o => o.trim());
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
}));

// ── Body parsing ──────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Global rate limiter ───────────────────────────────────────────────────
app.use('/api', apiLimiter);

// ── Health check ──────────────────────────────────────────────────────────
app.get('/health', (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ── API Routes ────────────────────────────────────────────────────────────
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

// ── 404 handler ───────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` }));

// ── Global error handler ──────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message);
  if (err.message.includes('CORS')) return res.status(403).json({ error: err.message });
  res.status(500).json({ error: 'Internal server error.' });
});

// ── Start ─────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅  Portfolio API running → http://localhost:${PORT}`);
  console.log(`📋  Environment: ${process.env.NODE_ENV || 'development'}`);
});
