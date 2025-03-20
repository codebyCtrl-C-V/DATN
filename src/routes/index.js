const express = require('express');
const router = express.Router();
const productController = require('../controllers/ProductController');

// Trang chủ
router.get('/', async (req, res) => {
    try {
        const products = await productController.getProductsForHome(); // Lấy danh sách sản phẩm
        const bestSellerProducts = await productController.getBestSellerProducts(); // Lấy danh sách sản phẩm bán chạy
        
        res.render('home', {
            user: res.locals.user, // Giữ nguyên dữ liệu user từ middleware
            ...products,
            bestSellerProducts: bestSellerProducts.products           
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi server');
    }
});

module.exports = router;