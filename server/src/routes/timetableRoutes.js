const express = require('express');
const router = express.Router();
const timetableController = require('../controllers/timetableController');
const authenticate = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/authorize');

router.use(authenticate);

router.get('/', timetableController.getTimetable);
router.post('/', authorizeRoles('super_admin', 'admin', 'principal'), timetableController.createTimetableSlot);

module.exports = router;

