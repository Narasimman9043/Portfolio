const { validationResult } = require('express-validator');

/**
 * Express-validator result checker middleware.
 * Place after validation chains, before controller.
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  next();
}

module.exports = { validate };
