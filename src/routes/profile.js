const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');
const {authMiddleware} = require('../middleware/auth');

router.get('/', authMiddleware, userController.profile);
router.get('/update', authMiddleware, userController.showProfileUpdate);
router.post('/update', authMiddleware, userController.updateProfile);
router.get('/change-password', authMiddleware, userController.showChangePassword);
router.post('/change-password', authMiddleware, userController.changePassword);

module.exports = router;