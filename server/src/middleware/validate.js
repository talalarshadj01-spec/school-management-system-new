const { validationResult } = require('express-validator');

/**
 * Middleware to handle express-validator validation results.
 * Returns 422 Unprocessable Entity with structured error list if validation fails.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed. Please check the submitted data.',
      errors: errors.array().map((e) => ({
        field: e.path || e.param,
        message: e.msg,
      })),
    });
  }
  next();
};

module.exports = validate;

