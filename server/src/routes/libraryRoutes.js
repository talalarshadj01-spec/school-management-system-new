const express = require('express');
const router = express.Router();
const libraryController = require('../controllers/libraryController');
const authenticate = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/authorize');

router.use(authenticate);

router.get('/books', libraryController.getBooks);
router.post('/books', authorizeRoles('super_admin', 'admin', 'librarian'), libraryController.createBook);

router.get('/issues', libraryController.getIssues);
router.post('/issues', authorizeRoles('super_admin', 'admin', 'librarian'), libraryController.issueBook);

module.exports = router;

