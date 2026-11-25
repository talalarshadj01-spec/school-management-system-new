const express = require('express');
const router = express.Router();
const homeworkController = require('../controllers/homeworkController');
const authenticate = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/authorize');

router.use(authenticate);

router.get('/', homeworkController.getHomework);
router.post('/', authorizeRoles('super_admin', 'admin', 'principal', 'teacher'), homeworkController.createHomework);

module.exports = router;

