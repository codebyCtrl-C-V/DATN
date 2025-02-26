const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./user.model");
const Product = require("./product.model");

const Review = sequelize.define("Review", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    rating: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
    comment: { type: DataTypes.TEXT },
}, { tableName: "reviews", timestamps: true });

Review.belongsTo(User, { foreignKey: "userId", onDelete: "CASCADE" });
Review.belongsTo(Product, { foreignKey: "productId", onDelete: "CASCADE" });

module.exports = Review;
