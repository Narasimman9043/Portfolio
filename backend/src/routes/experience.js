const router = require('express').Router();
const multer = require('multer');
const { body } = require('express-validator');
const { getExperience, createExperience, updateExperience, deleteExperience, uploadLogo } = require('../controllers/experienceController');
const { requireAuth } = require('../middleware/auth');
const { validate }    = require('../middleware/validate');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
const expValidation = [body('company').notEmpty(), body('role').notEmpty(), body('start_date').notEmpty()];

router.get('/',            getExperience);
router.post('/',           requireAuth, expValidation, validate, createExperience);
router.put('/:id',         requireAuth, expValidation, validate, updateExperience);
router.delete('/:id',      requireAuth, deleteExperience);
router.post('/:id/logo',   requireAuth, upload.single('image'), uploadLogo);

module.exports = router;
