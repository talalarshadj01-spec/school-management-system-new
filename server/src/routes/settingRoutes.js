const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const authenticate = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/authorize');

// Allow public read of basic settings (school name, currency, language)
router.get('/', settingController.getSettings);

// Only Admin can update school settings
router.put('/', authenticate, authorizeRoles('super_admin', 'admin'), settingController.updateSettings);

module.exports = router;

