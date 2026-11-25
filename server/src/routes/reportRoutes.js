const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authenticate = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/authorize');

router.use(authenticate);

router.get('/students/excel', authorizeRoles('super_admin', 'admin', 'principal', 'receptionist'), reportController.exportStudentsExcel);
router.get('/fees/excel', authorizeRoles('super_admin', 'admin', 'principal', 'accountant'), reportController.exportFeesExcel);

module.exports = router;

