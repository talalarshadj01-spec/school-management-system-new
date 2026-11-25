const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authenticate = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/authorize');

router.use(authenticate);

router.get('/', notificationController.getNotifications);
router.post('/', authorizeRoles('super_admin', 'admin', 'principal', 'receptionist'), notificationController.createNotification);

module.exports = router;

