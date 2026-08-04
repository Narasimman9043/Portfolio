const router = require('express').Router();
const { body } = require('express-validator');
const { login, logout, me } = require('../controllers/authController');
const { validate } = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/login',
  authLimiter,
  [body('email').isEmail(), body('password').notEmpty()],
  validate,
  login
);
router.post('/logout', logout);
router.get('/me', requireAuth, me);

module.exports = router;
