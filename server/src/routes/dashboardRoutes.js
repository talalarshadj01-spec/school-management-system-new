const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authenticate = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/authorize');

router.use(authenticate);

// Admin / Principal / Super Admin / Accountant Dashboard stats
router.get('/admin', authorizeRoles('super_admin', 'admin', 'principal', 'accountant'), dashboardController.getAdminDashboardStats);

// Teacher Dashboard
router.get('/teacher', authorizeRoles('teacher', 'super_admin', 'admin', 'principal'), dashboardController.getTeacherDashboard);

// Student Dashboard
router.get('/student', authorizeRoles('student', 'super_admin'), dashboardController.getStudentDashboard);

// Parent Dashboard
router.get('/parent', authorizeRoles('parent', 'super_admin'), dashboardController.getParentDashboard);

module.exports = router;

