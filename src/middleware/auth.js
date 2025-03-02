const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

// Middleware xác thực JWT
const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.redirect('/login');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: "Token không hợp lệ" });
    }
};

// Middleware kiểm tra role admin
const adminMiddleware = (req, res, next) => {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Bạn không có quyền!" });
    next();
};

//Middleware kiểm tra user có đăng nhập chưa
const checkLoginMiddleware = (req, res, next) => {
    const token = req.cookies.token;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            res.locals.user = decoded;
       
        } catch (error) {
            res.locals.user = null;
        }
    } else {
        res.locals.user = null;
    }
    res.locals.success = req.query.success === "1";
    next();
};

module.exports = { authMiddleware, adminMiddleware, checkLoginMiddleware };
