const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Order = require("./Order");

const Payment = sequelize.define("Payment", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    payment_method: { 
        type: DataTypes.ENUM("COD", "Bank Transfer", "Momo", "ZaloPay"),
        allowNull: false 
    },
    status: { 
        type: DataTypes.ENUM("pending", "paid", "failed"),
        defaultValue: "pending"
    },
}, { tableName: "payments", timestamps: true });

Payment.belongsTo(Order, { foreignKey: "orderId", onDelete: "CASCADE" });

module.exports = Payment;
