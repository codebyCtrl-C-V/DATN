const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Category = require("./Category");
const { default: slugify } = require("slugify");

const Product = sequelize.define("Product", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    slug: { type: DataTypes.STRING , allowNull: false, unique: true },
    description: { type: DataTypes.TEXT },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    stock: { type: DataTypes.INTEGER, defaultValue: 0 },
    image: { type: DataTypes.STRING },
    sale: {type: DataTypes.INTEGER, defaultValue: 0},
    category_id: { type: DataTypes.INTEGER },
}, { tableName: "products", timestamps: true });

Product.belongsTo(Category, { foreignKey: "category_id", onDelete: "SET NULL" });

module.exports = Product;
