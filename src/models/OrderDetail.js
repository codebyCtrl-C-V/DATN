const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Order = require("./Order");
const Product = require("./Product");

const OrderDetail = sequelize.define("OrderDetail", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    orderId: { type: DataTypes.INTEGER, allowNull: false },
    productId: { type: DataTypes.INTEGER, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    total: { type: DataTypes.DECIMAL(10, 2), allowNull: false }
}, { tableName: "order_details", timestamps: true });

//OrderDetail.belongsTo(Order, { foreignKey: "orderId", onDelete: "CASCADE" });
OrderDetail.belongsTo(Product, { foreignKey: "productId", onDelete: "CASCADE" });

module.exports = OrderDetail;
