const router = require('express').Router();
const multer = require('multer');
const { getResume, uploadResume, deleteResume } = require('../controllers/resumeController');
const { requireAuth } = require('../middleware/auth');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.get('/',    getResume);
router.post('/',   requireAuth, upload.single('resume'), uploadResume);
router.delete('/', requireAuth, deleteResume);

module.exports = router;
