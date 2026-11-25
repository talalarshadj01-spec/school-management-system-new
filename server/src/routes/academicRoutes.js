const express = require('express');
const router = express.Router();
const academicController = require('../controllers/academicController');
const authenticate = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/authorize');

router.use(authenticate);

// Sessions
router.get('/sessions', academicController.getSessions);
router.post('/sessions', authorizeRoles('super_admin', 'admin', 'principal'), academicController.createSession);
router.put('/sessions/:id/activate', authorizeRoles('super_admin', 'admin', 'principal'), academicController.setActiveSession);

// Classes & Sections
router.get('/classes', academicController.getClasses);
router.post('/classes', authorizeRoles('super_admin', 'admin', 'principal'), academicController.createClass);

// Subjects
router.get('/subjects', academicController.getSubjects);
router.post('/subjects', authorizeRoles('super_admin', 'admin', 'principal'), academicController.createSubject);
router.post('/assign-subject', authorizeRoles('super_admin', 'admin', 'principal'), academicController.assignSubject);

module.exports = router;

