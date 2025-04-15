const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");
const OrderDetail = require("./OrderDetail");

const Order = sequelize.define("Order", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: false },
    address: { type: DataTypes.TEXT, allowNull: false },
    paymentMethod: { type: DataTypes.STRING, allowNull: false },
    total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    status: { 
        type: DataTypes.ENUM('pending', 'processing', 'completed', 'cancelled'),
        defaultValue: 'pending'
    }
}, { tableName: "orders", timestamps: true });

Order.belongsTo(User, { foreignKey: "userId", onDelete: "CASCADE" });
Order.hasMany(OrderDetail, { foreignKey: "orderId", onDelete: "CASCADE" });

module.exports = Order;
