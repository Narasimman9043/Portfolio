const router = require('express').Router();
const { body } = require('express-validator');
const { getSocialLinks, upsertSocialLink, deleteSocialLink } = require('../controllers/socialLinksController');
const { requireAuth } = require('../middleware/auth');
const { validate }    = require('../middleware/validate');

router.get('/',      getSocialLinks);
router.post('/',     requireAuth, [body('platform').notEmpty(), body('url').notEmpty().isURL()], validate, upsertSocialLink);
router.delete('/:id',requireAuth, deleteSocialLink);

module.exports = router;
