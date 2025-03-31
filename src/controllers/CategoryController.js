const slugify = require("slugify");
const Category = require("../models/Category");
const Product = require("../models/Product");
const { Op } = require("sequelize"); 

class CategoryController {
  // // tạo category
  // async createCategory(req, res) {
  //     const { name } = req.body;
  //     const slug = slugify(name, { lower: true, strict: true });

  //     await Category.create({ name, slug });
  //     res.redirect("/categories");
  // }

  // lấy sản phẩm theo category
  async getCategoryProducts(req, res) {
    try {
      const { slug } = req.params;
      const { sort, page = 1 } = req.query; // Lấy tham số sort và page từ query
      const limit = 10; // Số sản phẩm trên mỗi trang
      const offset = (page - 1) * limit; // Vị trí bắt đầu lấy sản phẩm

      let order = [];
      if (sort === "price-asc") order = [["price", "ASC"]];
      else if (sort === "price-desc") order = [["price", "DESC"]];
      else if (sort === "name-asc") order = [["name", "ASC"]];
      else if (sort === "name-desc") order = [["name", "DESC"]];
      else order = [['createdAt', 'DESC']]

      // Tìm danh mục theo slug
      const category = await Category.findOne({ where: { slug }, raw: true });
      if (!category) {
        return res.status(404).send("Category not found");
      }

      // Lấy tổng số sản phẩm trong danh mục
      const totalProducts = await Product.count({
        where: { category_id: category.id },
      });

      // Lấy danh sách sản phẩm có phân trang
      const products = await Product.findAll({
        where: { category_id: category.id },
        limit: limit,
        offset: offset,
        order: order,
        raw: true,
      });

      // Tính tổng số trang
      const totalPages = Math.ceil(totalProducts / limit);

      res.render("product/productList", {
        category,
        products,
        currentPage: page,
        totalPages,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Lỗi server");
    }
  }

  // lấy sản phẩm rau củ/trái cây giảm giá
  async getProductsSale(req, res) {
    try {
      const { page = 1 } = req.query; 
      const limit = 10; 
      const offset = (page - 1) * limit; 

      // Lấy tổng số sản phẩm trong danh mục
      const totalProducts = await Product.count({
        where: {
          id: [1, 2], 
          sale: { [Op.gt]: 0 } // sale > 0
        }
      });

      // Lấy danh sách sản phẩm có phân trang
      const products = await Product.findAll({
        where: {
          id: [1, 2], 
          sale: { [Op.gt]: 0 } // sale > 0
        },
        limit: limit,
        offset: offset,
        order: [['updatedAt', 'DESC']],
        raw: true,
      });

      // Tính tổng số trang
      const totalPages = Math.ceil(totalProducts / limit);

      res.render("product/productSale", {
        products,
        currentPage: page,
        totalPages,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Lỗi server");
    }
  }

  // lấy sản phẩm rau củ/trái cây giảm giá
  async getProductsSale(req, res) {
    try {
      const { page = 1 } = req.query; 
      const limit = 10; 
      const offset = (page - 1) * limit; 

      // Lấy tổng số sản phẩm trong danh mục
      const totalProducts = await Product.count({
        where: {
          category_id: [1, 2], 
          sale: { [Op.gt]: 0 } // sale > 0
        }
      });

      // Lấy danh sách sản phẩm có phân trang
      const products = await Product.findAll({
        where: {
          category_id: [1, 2], 
          sale: { [Op.gt]: 0 } // sale > 0
        },
        limit: limit,
        offset: offset,
        order: [['updatedAt', 'DESC']],
        raw: true,
      });

      // Tính tổng số trang
      const totalPages = Math.ceil(totalProducts / limit);

      res.render("product/productSale", {
        products,
        currentPage: page,
        totalPages,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Lỗi server");
    }
  }
  
  // lấy sản phẩm thực phẩm chế biến giảm giá
  async getProductsSaleProceed(req, res) {
    try {
      const { page = 1 } = req.query; 
      const limit = 10; 
      const offset = (page - 1) * limit; 

      // Lấy tổng số sản phẩm trong danh mục
      const totalProducts = await Product.count({
        where: {
          category_id: 4, 
          sale: { [Op.gt]: 0 } // sale > 0
        }
      });

      // Lấy danh sách sản phẩm có phân trang
      const products = await Product.findAll({
        where: {
          category_id: 4, 
          sale: { [Op.gt]: 0 } // sale > 0
        },
        limit: limit,
        offset: offset,
        order: [['updatedAt', 'DESC']],
        raw: true,
      });

      // Tính tổng số trang
      const totalPages = Math.ceil(totalProducts / limit);

      res.render("product/productSale", {
        products,
        currentPage: page,
        totalPages,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Lỗi server");
    }
  }
}

module.exports = new CategoryController();
