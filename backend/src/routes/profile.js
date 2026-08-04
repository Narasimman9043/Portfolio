const router  = require('express').Router();
const multer  = require('multer');
const { body } = require('express-validator');
const { getProfile, updateProfile, uploadProfileImage } = require('../controllers/profileController');
const { requireAuth } = require('../middleware/auth');
const { validate }    = require('../middleware/validate');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/',    getProfile);
router.put('/',    requireAuth,
  [body('full_name').notEmpty(), body('email').isEmail()],
  validate, updateProfile
);
router.post('/image', requireAuth, upload.single('image'), uploadProfileImage);

module.exports = router;
