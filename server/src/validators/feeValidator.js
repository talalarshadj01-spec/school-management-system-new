const { body, param } = require('express-validator');

const collectPaymentValidator = [
  body('voucherId')
    .notEmpty().withMessage('Voucher ID is required')
    .isInt({ min: 1 }).withMessage('Invalid voucher ID'),
  body('amountPaid')
    .notEmpty().withMessage('Amount paid is required')
    .isFloat({ min: 1 }).withMessage('Amount must be greater than 0'),
  body('paymentMethod')
    .notEmpty().withMessage('Payment method is required')
    .isIn(['cash', 'bank_transfer', 'cheque', 'online'])
    .withMessage('Invalid payment method. Must be one of: cash, bank_transfer, cheque, online'),
  body('paymentDate')
    .optional({ nullable: true, checkFalsy: true })
    .isDate().withMessage('Payment date must be a valid date'),
  body('remarks')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Remarks cannot exceed 500 characters')
    .escape(),
];

const generateVouchersValidator = [
  body('month')
    .notEmpty().withMessage('Month is required')
    .isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12'),
  body('year')
    .notEmpty().withMessage('Year is required')
    .isInt({ min: 2020, max: 2035 }).withMessage('Year must be between 2020 and 2035'),
  body('sessionId')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 }).withMessage('Invalid session ID'),
];

const addAdjustmentValidator = [
  body('studentId')
    .notEmpty().withMessage('Student ID is required')
    .isInt({ min: 1 }).withMessage('Invalid student ID'),
  body('type')
    .notEmpty().withMessage('Adjustment type is required')
    .isIn(['discount', 'waiver', 'fine', 'extra']).withMessage('Invalid adjustment type'),
  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('reason')
    .notEmpty().withMessage('Reason is required')
    .trim()
    .isLength({ min: 5, max: 500 }).withMessage('Reason must be between 5 and 500 characters'),
];

module.exports = {
  collectPaymentValidator,
  generateVouchersValidator,
  addAdjustmentValidator,
};

