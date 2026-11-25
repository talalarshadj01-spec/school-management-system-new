const express = require('express');
const router = express.Router();
const transportController = require('../controllers/transportController');
const authenticate = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/authorize');

router.use(authenticate);

router.get('/', transportController.getTransport);
router.post('/routes', authorizeRoles('super_admin', 'admin'), transportController.createRoute);

module.exports = router;

