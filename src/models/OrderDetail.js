const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Order = require("./order.model");
const Product = require("./product.model");

const OrderDetail = sequelize.define("OrderDetail", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
}, { tableName: "order_details", timestamps: true });

OrderDetail.belongsTo(Order, { foreignKey: "orderId", onDelete: "CASCADE" });
OrderDetail.belongsTo(Product, { foreignKey: "productId", onDelete: "CASCADE" });

module.exports = OrderDetail;
