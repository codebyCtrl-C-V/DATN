const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./user.model");
const Product = require("./product.model");

const Cart = sequelize.define("Cart", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
}, { tableName: "cart", timestamps: true });

Cart.belongsTo(User, { foreignKey: "userId", onDelete: "CASCADE" });
Cart.belongsTo(Product, { foreignKey: "productId", onDelete: "CASCADE" });

module.exports = Cart;
