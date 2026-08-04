const router = require('express').Router();
const { body } = require('express-validator');
const {
  getAchievements, createAchievement, updateAchievement, deleteAchievement,
} = require('../controllers/achievementsController');
const { requireAuth } = require('../middleware/auth');
const { validate }    = require('../middleware/validate');

router.get('/',      getAchievements);
router.post('/',     requireAuth, [body('title').notEmpty()], validate, createAchievement);
router.put('/:id',   requireAuth, [body('title').notEmpty()], validate, updateAchievement);
router.delete('/:id',requireAuth, deleteAchievement);

module.exports = router;
