const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');
const {authMiddleware} = require('../middleware/auth');

router.get('/', authMiddleware, userController.logout);

module.exports = router;