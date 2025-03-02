const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');

router.get('/', userController.indexRegister);
router.post('/', userController.register);

module.exports = router;
