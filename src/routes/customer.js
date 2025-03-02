const express = require("express");
const { authMiddleware, adminMiddleware } = require("../middlewares/auth");

const router = express.Router();

router.get("/profile", authMiddleware, (req, res) => {
    res.json({ message: "Chào mừng!", user: req.user });
});


module.exports = router;
