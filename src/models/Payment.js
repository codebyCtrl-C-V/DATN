const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Order = require("./Order");

const Payment = sequelize.define("Payment", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    orderId: { type: DataTypes.INTEGER, allowNull: false },
    paymentMethod: { 
        type: DataTypes.ENUM("cod", "online"),
        allowNull: false 
    },
    status: { 
        type: DataTypes.ENUM("pending", "paid", "failed"),
        defaultValue: "pending"
    },
}, { tableName: "payments", timestamps: true });

Payment.belongsTo(Order, { foreignKey: "orderId", onDelete: "CASCADE" });

module.exports = Payment;
