const router = require('express').Router();
const multer = require('multer');
const { body } = require('express-validator');
const { getCertificates, createCertificate, updateCertificate, deleteCertificate, uploadCertificateImage } = require('../controllers/certificatesController');
const { requireAuth } = require('../middleware/auth');
const { validate }    = require('../middleware/validate');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const certValidation = [body('title').notEmpty(), body('issuer').notEmpty()];

router.get('/',              getCertificates);
router.post('/',             requireAuth, certValidation, validate, createCertificate);
router.put('/:id',           requireAuth, certValidation, validate, updateCertificate);
router.delete('/:id',        requireAuth, deleteCertificate);
router.post('/:id/image',    requireAuth, upload.single('image'), uploadCertificateImage);

module.exports = router;
