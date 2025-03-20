const Category = require("../models/Category");

async function getCategories(req, res, next) {
    try {
        const categories = await Category.findAll();
        res.locals.categories = categories.map(category => category.toJSON());
        next();
    } catch (error) {
        console.error("Lỗi lấy danh mục:", error);
        next(error);
    }
}

module.exports = getCategories;
