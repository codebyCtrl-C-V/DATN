const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/CategoryController');

router.get('/:slug', categoryController.getCategoryProducts);

module.exports = router;
