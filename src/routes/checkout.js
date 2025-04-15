const express = require('express');
const router = express.Router();
const {authMiddleware} = require('../middleware/auth');
const checkoutController = require('../controllers/CheckoutController');

router.get('/', authMiddleware, checkoutController.getCheckout);
router.post('/submit', authMiddleware, checkoutController.submitOrder);

module.exports = router;