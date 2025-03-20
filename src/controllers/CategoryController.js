const slugify = require("slugify");

async function createCategory(req, res) {
    const { name } = req.body;
    const slug = slugify(name, { lower: true, strict: true });

    await Category.create({ name, slug });
    res.redirect("/categories");
}

module.exports = {
    createCategory
};
