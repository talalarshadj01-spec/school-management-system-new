const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const authenticate = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/authorize');

router.use(authenticate);

// Get attendance for class/section/date
router.get('/class', authorizeRoles('super_admin', 'admin', 'principal', 'teacher'), attendanceController.getClassAttendance);

// Save bulk attendance
router.post('/bulk', authorizeRoles('super_admin', 'admin', 'principal', 'teacher'), attendanceController.saveBulkAttendance);

// Monthly attendance report
router.get('/report', authorizeRoles('super_admin', 'admin', 'principal', 'teacher', 'receptionist'), attendanceController.getMonthlyReport);

module.exports = router;

