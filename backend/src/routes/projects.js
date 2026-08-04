const router = require('express').Router();
const multer = require('multer');
const { body } = require('express-validator');
const {
  getProjects, createProject, updateProject, deleteProject, uploadProjectImage,
} = require('../controllers/projectsController');
const { requireAuth } = require('../middleware/auth');
const { validate }    = require('../middleware/validate');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/',               getProjects);
router.post('/',              requireAuth, [body('title').notEmpty().withMessage('Title is required.')], validate, createProject);
router.put('/:id',            requireAuth, [body('title').notEmpty().withMessage('Title is required.')], validate, updateProject);
router.delete('/:id',         requireAuth, deleteProject);
router.post('/:id/image',     requireAuth, upload.single('image'), uploadProjectImage);

module.exports = router;
