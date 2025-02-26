const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Category = require("./category.model");

const Product = sequelize.define("Product", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    stock: { type: DataTypes.INTEGER, defaultValue: 0 },
    image: { type: DataTypes.STRING },
}, { tableName: "products", timestamps: true });

Product.belongsTo(Category, { foreignKey: "categoryId", onDelete: "SET NULL" });

module.exports = Product;
