const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');

router.get('/', userController.indexLogin);
router.post('/', userController.login);

module.exports = router;