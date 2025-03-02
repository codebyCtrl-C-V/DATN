const express = require("express");
const { authMiddleware, adminMiddleware } = require("../middlewares/auth");

const router = express.Router();

router.get("/admin/dashboard", authMiddleware, adminMiddleware, (req, res) => {
    res.json({ message: "Chào Admin!", user: req.user });
});

module.exports = router;
