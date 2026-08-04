const router = require('express').Router();
const { body } = require('express-validator');
const { getEducation, createEducation, updateEducation, deleteEducation } = require('../controllers/educationController');
const { requireAuth } = require('../middleware/auth');
const { validate }    = require('../middleware/validate');

const eduValidation = [body('college').notEmpty(), body('degree').notEmpty(), body('start_year').notEmpty()];

router.get('/',      getEducation);
router.post('/',     requireAuth, eduValidation, validate, createEducation);
router.put('/:id',   requireAuth, eduValidation, validate, updateEducation);
router.delete('/:id',requireAuth, deleteEducation);

module.exports = router;
