const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const News = sequelize.define("News", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    slug: { type: DataTypes.STRING, allowNull: false, unique: true },
    content: { type: DataTypes.TEXT, allowNull: false },
    image: { type: DataTypes.STRING, allowNull: false },
}, { tableName: "news", timestamps: true });

module.exports = News;
