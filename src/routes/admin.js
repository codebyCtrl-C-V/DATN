const express = require("express");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");
const adminController = require('../controllers/AdminController');
const upload = require('../middleware/upload');

const router = express.Router();

router.get("/dashboard", authMiddleware, adminMiddleware, adminController.dashboard);

// Quản lý tài khoản
router.get("/user", authMiddleware, adminMiddleware, adminController.getUsers);
router.get("/user/search", authMiddleware, adminMiddleware, adminController.searchUser);
router.post("/user", authMiddleware, adminMiddleware, adminController.createUser);
router.post("/user/update", authMiddleware, adminMiddleware, adminController.updateUser);
router.post("/user/delete", authMiddleware, adminMiddleware, adminController.deleteUser);

// Quản lý sản phẩm
router.get("/product", authMiddleware, adminMiddleware, adminController.getProducts);
router.get("/product/search", authMiddleware, adminMiddleware, adminController.searchProduct);
router.post("/product", authMiddleware, adminMiddleware, upload.single('image'), adminController.createProduct);
router.post("/product/update", authMiddleware, adminMiddleware, upload.single('image'), adminController.updateProduct);
router.post("/product/delete", authMiddleware, adminMiddleware, adminController.deleteProduct);

// Quản lý đơn hàng
router.get('/orders', authMiddleware, adminMiddleware, adminController.getOrders);
router.get('/orders/detail/:id', authMiddleware, adminMiddleware, adminController.getOrderDetail);
router.post('/orders/:id/status', authMiddleware, adminMiddleware, adminController.updateOrderStatus);
router.get('/orders/search', authMiddleware, adminMiddleware, adminController.searchOrders);
router.get('/orders/statistics', authMiddleware, adminMiddleware, adminController.getOrderStatistics);

// Quản lý thanh toán
router.get('/payment', authMiddleware, adminMiddleware, adminController.getPayments);
router.post('/payment/:id/status', authMiddleware, adminMiddleware, adminController.updatePaymentStatus);
router.get('/payment/search', authMiddleware, adminMiddleware, adminController.searchPayment);

// Quản lý danh mục
router.get('/categories', authMiddleware, adminMiddleware, adminController.getCategories);
router.post('/categories', authMiddleware, adminMiddleware, adminController.createCategory);
router.post('/categories/update', authMiddleware, adminMiddleware, adminController.updateCategory);
router.post('/categories/delete', authMiddleware, adminMiddleware, adminController.deleteCategory);

// Quản lý tin tức
router.get("/news", authMiddleware, adminMiddleware, adminController.getNews);
router.get("/news/search", authMiddleware, adminMiddleware, adminController.searchNews);
router.post("/news", authMiddleware, adminMiddleware, upload.single('image'), adminController.createNews);
router.post("/news/update", authMiddleware, adminMiddleware, upload.single('image'), adminController.updateNews);
router.post("/news/delete", authMiddleware, adminMiddleware, adminController.deleteNews);

module.exports = router;
