const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/CategoryController');

router.get('/:slug', categoryController.getCategoryProducts);
router.get('/sale/vegetables-fruits', categoryController.getProductsSale);
router.get('/sale/proceed', categoryController.getProductsSaleProceed);

module.exports = router;
