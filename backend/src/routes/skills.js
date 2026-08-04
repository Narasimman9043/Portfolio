const router = require('express').Router();
const { body } = require('express-validator');
const { getSkills, createSkill, updateSkill, deleteSkill, reorderSkills } = require('../controllers/skillsController');
const { requireAuth } = require('../middleware/auth');
const { validate }    = require('../middleware/validate');

const skillValidation = [body('skill_name').notEmpty(), body('category').notEmpty()];

router.get('/',              getSkills);
router.post('/',             requireAuth, skillValidation, validate, createSkill);
router.put('/reorder',       requireAuth, reorderSkills);
router.put('/:id',           requireAuth, skillValidation, validate, updateSkill);
router.delete('/:id',        requireAuth, deleteSkill);

module.exports = router;
