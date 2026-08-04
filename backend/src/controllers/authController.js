const jwt = require('jsonwebtoken');
const { supabase } = require('../config/supabase');

/**
 * POST /api/auth/login
 * Signs in via Supabase Auth and returns a JWT for API calls.
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(401).json({ error: 'Invalid email or password.' });

    const token = jwt.sign(
      { id: data.user.id, email: data.user.email, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({ token, user: { id: data.user.id, email: data.user.email } });
  } catch (err) {
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
}

/**
 * POST /api/auth/logout
 * Stateless JWT — client discards the token.
 */
function logout(req, res) {
  res.json({ message: 'Logged out successfully.' });
}

/**
 * GET /api/auth/me
 * Returns the decoded user from the JWT (requires auth middleware).
 */
function me(req, res) {
  res.json({ user: req.user });
}

module.exports = { login, logout, me };
