const express = require('express');
const router = express.Router();
const cartController = require('../controllers/CartController');
const {authMiddleware} = require('../middleware/auth');

router.get('/', authMiddleware, cartController.getCart);
router.post('/add', authMiddleware, cartController.addToCart);
router.post('/delete/:id', authMiddleware, cartController.deleteCart);
router.post('/update/:id', authMiddleware, cartController.updateCart);

module.exports = router;