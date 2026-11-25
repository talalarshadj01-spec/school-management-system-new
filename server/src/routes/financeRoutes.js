const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');
const authenticate = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/authorize');

router.use(authenticate);

// Expenses
router.get('/expenses', authorizeRoles('super_admin', 'admin', 'principal', 'accountant'), financeController.getExpenses);
router.post('/expenses', authorizeRoles('super_admin', 'admin', 'accountant'), financeController.createExpense);

// Incomes
router.get('/incomes', authorizeRoles('super_admin', 'admin', 'principal', 'accountant'), financeController.getIncomes);
router.post('/incomes', authorizeRoles('super_admin', 'admin', 'accountant'), financeController.createIncome);

// Salaries
router.get('/salaries', authorizeRoles('super_admin', 'admin', 'principal', 'accountant'), financeController.getSalaries);
router.post('/salaries', authorizeRoles('super_admin', 'admin', 'accountant'), financeController.paySalary);

module.exports = router;

