const express = require('express');
const router = express.Router();
const productController = require('../controllers/ProductController');
const newsController = require('../controllers/NewsController');

// Trang chủ
router.get('/', async (req, res) => {
    try {
        const products = await productController.getProductsForHome(); // Lấy danh sách sản phẩm
        const bestSellerProducts = await productController.getBestSellerProducts(); // Lấy danh sách sản phẩm bán chạy
        const newProducts = await productController.getNewProducts(); // Lấy danh sách sản phẩm mới
        const getNewsForHome = await newsController.getNewsForHome(); // Lấy danh sách tin tức
        
        res.render('home', {
            user: res.locals.user, // Giữ nguyên dữ liệu user từ middleware
            ...products,
            bestSellerProducts: bestSellerProducts.products,
            newProducts: newProducts,
            getNewsForHome: getNewsForHome,           
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi server');
    }
});

module.exports = router;