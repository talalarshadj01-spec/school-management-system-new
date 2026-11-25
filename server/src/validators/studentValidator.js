const { body, param, query } = require('express-validator');

const createStudentValidator = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('First name is required')
    .isLength({ max: 50 }).withMessage('First name cannot exceed 50 characters')
    .matches(/^[a-zA-Z\s.'-]+$/).withMessage('First name must contain only letters'),
  body('lastName')
    .trim()
    .notEmpty().withMessage('Last name is required')
    .isLength({ max: 50 }).withMessage('Last name cannot exceed 50 characters')
    .matches(/^[a-zA-Z\s.'-]+$/).withMessage('Last name must contain only letters'),
  body('gender')
    .notEmpty().withMessage('Gender is required')
    .isIn(['male', 'female', 'other']).withMessage('Gender must be male, female, or other'),
  body('dateOfBirth')
    .notEmpty().withMessage('Date of birth is required')
    .isDate().withMessage('Please provide a valid date of birth (YYYY-MM-DD)'),
  body('phone')
    .optional({ nullable: true, checkFalsy: true })
    .matches(/^(\+92|0)[0-9]{10}$/)
    .withMessage('Phone must be a valid Pakistani number (e.g., 03001234567)'),
  body('guardianPhone')
    .optional({ nullable: true, checkFalsy: true })
    .matches(/^(\+92|0)[0-9]{10}$/)
    .withMessage('Guardian phone must be a valid Pakistani number (e.g., 03001234567)'),
  body('classId')
    .notEmpty().withMessage('Class is required')
    .isInt({ min: 1 }).withMessage('Please select a valid class'),
  body('email')
    .optional({ nullable: true, checkFalsy: true })
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),
];

const updateStudentValidator = [
  param('id').isInt({ min: 1 }).withMessage('Invalid student ID'),
  body('firstName')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('First name cannot exceed 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Last name cannot exceed 50 characters'),
  body('phone')
    .optional({ nullable: true, checkFalsy: true })
    .matches(/^(\+92|0)[0-9]{10}$/)
    .withMessage('Phone must be a valid Pakistani number'),
  body('email')
    .optional({ nullable: true, checkFalsy: true })
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),
];

const studentQueryValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
];

module.exports = {
  createStudentValidator,
  updateStudentValidator,
  studentQueryValidator,
};

