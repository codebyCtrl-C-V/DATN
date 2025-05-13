const express = require('express');
const router = express.Router();
const { createPaymentUrl, vnpayReturn } = require('../controllers/payment.controller');
const { authMiddleware } = require('../middleware/auth');

router.post('/create_payment_url',authMiddleware, createPaymentUrl);
router.get('/vnpay_return',authMiddleware, vnpayReturn);

module.exports = router; 