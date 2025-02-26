const sequelize = require("../config/database");

const User = require("./user.model");
const Category = require("./category.model");
const Product = require("./product.model");
const Order = require("./order.model");
const OrderDetail = require("./orderDetail.model");
const Cart = require("./cart.model");
const Review = require("./review.model");
const Payment = require("./payment.model");


sequelize.sync({ alter: true }) 
    .then(() => console.log("🔄 Cấu trúc bảng đồng bộ!"))
    .catch(err => console.error("❌ Lỗi đồng bộ bảng:", err));

module.exports = { User, Category, Product, Order, OrderDetail, Cart, Review, Payment };
