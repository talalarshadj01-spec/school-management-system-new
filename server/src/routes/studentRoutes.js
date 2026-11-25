const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const authenticate = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { createStudentValidator, updateStudentValidator, studentQueryValidator } = require('../validators/studentValidator');

router.use(authenticate);

// List students
router.get(
  '/',
  authorizeRoles('super_admin', 'admin', 'principal', 'teacher', 'receptionist', 'accountant'),
  studentQueryValidator,
  validate,
  studentController.getStudents
);

// Get single student full profile
router.get(
  '/:id',
  authorizeRoles('super_admin', 'admin', 'principal', 'teacher', 'receptionist', 'accountant'),
  studentController.getStudentById
);

// Add student
router.post(
  '/',
  authorizeRoles('super_admin', 'admin', 'principal', 'receptionist'),
  createStudentValidator,
  validate,
  studentController.createStudent
);

// Update student
router.put(
  '/:id',
  authorizeRoles('super_admin', 'admin', 'principal', 'receptionist'),
  updateStudentValidator,
  validate,
  studentController.updateStudent
);

// Archive student
router.delete(
  '/:id',
  authorizeRoles('super_admin', 'admin', 'principal'),
  studentController.deleteStudent
);

// Promote student
router.post(
  '/:id/promote',
  authorizeRoles('super_admin', 'admin', 'principal'),
  studentController.promoteStudent
);

module.exports = router;
