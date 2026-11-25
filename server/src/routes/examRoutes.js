const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const authenticate = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/authorize');

router.use(authenticate);

router.get('/', examController.getExams);
router.post('/', authorizeRoles('super_admin', 'admin', 'principal'), examController.createExam);
router.post('/subjects', authorizeRoles('super_admin', 'admin', 'principal'), examController.addExamSubject);

router.get('/marks-sheet/:examSubjectId', authorizeRoles('super_admin', 'admin', 'principal', 'teacher'), examController.getMarksSheet);
router.post('/marks-sheet/:examSubjectId', authorizeRoles('super_admin', 'admin', 'principal', 'teacher'), examController.saveMarks);

router.put('/:id/publish', authorizeRoles('super_admin', 'admin', 'principal'), examController.togglePublish);

router.get('/:examinationId/report-card/:studentId', examController.getStudentReportCard);

module.exports = router;

