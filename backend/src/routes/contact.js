const router = require('express').Router();
const { submitContact, getMessages, markRead, deleteMessage } = require('../controllers/contactController');
const { requireAuth }    = require('../middleware/auth');
const { contactLimiter } = require('../middleware/rateLimiter');

router.post('/',          contactLimiter, submitContact);
router.get('/',           requireAuth, getMessages);
router.patch('/:id/read', requireAuth, markRead);
router.delete('/:id',     requireAuth, deleteMessage);

module.exports = router;
