const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const orderController = require('../controllers/OrderController');

router.get('/', authMiddleware, orderController.getOrders);
//router.get('/:id', authMiddleware, orderController.getOrderDetail);
router.post('/:id/cancel', authMiddleware, orderController.cancelOrder);

module.exports = router;