const express = require("express");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");
const adminController = require('../controllers/AdminController');

const router = express.Router();

router.get("/dashboard", authMiddleware, adminMiddleware, adminController.dashboard);

router.get("/user", authMiddleware, adminMiddleware, adminController.getUsers);
router.post("/user", authMiddleware, adminMiddleware, adminController.createUser);
router.post("/user/update", authMiddleware, adminMiddleware, adminController.updateUser);
router.post("/user/delete", authMiddleware, adminMiddleware, adminController.deleteUser);

router.get("/product", authMiddleware, adminMiddleware, adminController.getProducts);
router.post("/product", authMiddleware, adminMiddleware, adminController.createProduct);
router.post("/product/update", authMiddleware, adminMiddleware, adminController.updateProduct);
router.post("/product/delete", authMiddleware, adminMiddleware, adminController.deleteProduct);


module.exports = router;
