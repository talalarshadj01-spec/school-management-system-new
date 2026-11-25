const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticate = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/authorize');

router.use(authenticate);

router.get('/', authorizeRoles('super_admin', 'admin'), userController.getUsers);
router.post('/', authorizeRoles('super_admin', 'admin'), userController.createUser);
router.put('/:id/status', authorizeRoles('super_admin', 'admin'), userController.updateUserStatus);

module.exports = router;

