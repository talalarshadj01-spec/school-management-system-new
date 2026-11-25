const express = require('express');
const router = express.Router();
const feeController = require('../controllers/feeController');
const authenticate = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { collectPaymentValidator, generateVouchersValidator } = require('../validators/feeValidator');

router.use(authenticate);

// Categories & Structures
router.get('/categories', feeController.getCategories);
router.post('/categories', authorizeRoles('super_admin', 'admin', 'accountant'), feeController.createCategory);

router.get('/structures', feeController.getStructures);
router.post('/structures', authorizeRoles('super_admin', 'admin', 'accountant'), feeController.createStructure);

// Vouchers & Collection
router.get('/vouchers', feeController.getVouchers);
router.post(
  '/vouchers/generate',
  authorizeRoles('super_admin', 'admin', 'accountant'),
  generateVouchersValidator,
  validate,
  feeController.generateMonthlyVouchers
);
router.post(
  '/payments/collect',
  authorizeRoles('super_admin', 'admin', 'accountant'),
  collectPaymentValidator,
  validate,
  feeController.recordPayment
);
router.get(
  '/defaulters',
  authorizeRoles('super_admin', 'admin', 'principal', 'accountant'),
  feeController.getDefaulters
);

module.exports = router;
