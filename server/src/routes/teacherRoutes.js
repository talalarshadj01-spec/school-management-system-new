const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const authenticate = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/authorize');

router.use(authenticate);

// Get all teachers
router.get('/', authorizeRoles('super_admin', 'admin', 'principal', 'teacher', 'receptionist'), teacherController.getTeachers);

// Get single teacher profile
router.get('/:id', authorizeRoles('super_admin', 'admin', 'principal', 'teacher'), teacherController.getTeacherById);

// Create teacher
router.post('/', authorizeRoles('super_admin', 'admin', 'principal'), teacherController.createTeacher);

// Update teacher
router.put('/:id', authorizeRoles('super_admin', 'admin', 'principal'), teacherController.updateTeacher);

module.exports = router;

