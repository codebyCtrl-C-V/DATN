const Product = require("../models/Product");
const { Op } = require("sequelize");

class ProductController {
  // Lấy danh sách sản phẩm cho trang home
  async getProductsForHome() {
    try {
      const vegetables = await Product.findAll({
        where: { category_id: 2 },
        limit: 10,
        raw: true, // Lấy dữ liệu dưới dạng object thuần
      });
      const fruits = await Product.findAll({
        where: { category_id: 1 },
        limit: 10,
        raw: true,
      });
      const juices = await Product.findAll({
        where: { category_id: 3 },
        limit: 10,
        raw: true,
      });
      const processed = await Product.findAll({
        where: { category_id: 4 },
        limit: 10,
        raw: true,
      });

      return { vegetables, fruits, juices, processed };
    } catch (error) {
      console.error("Lỗi lấy sản phẩm:", error);
      return { vegetables: [], fruits: [], juices: [], processed: [] }; // Trả về mảng rỗng nếu lỗi
    }
  }
  async getBestSellerProducts() {
    try {
      const products = await Product.findAll({
        order: [["sale", "DESC"]],
        limit: 10,
      });
      const bestSellerWithDiscount = products.map((product) => ({
        ...product.toJSON(), // Chuyển Sequelize object về JSON
        discountPrice: product.price * (1 - product.sale / 100), // Giảm giá
      }));

      return { products: bestSellerWithDiscount };
    } catch (error) {
      console.error("Lỗi lấy sản phẩm bán chạy:", error);
      return [];
    }
  }
  async getNewProducts() {
    try {
      const products = await Product.findAll({
        order: [["updatedAt", "DESC"]],
        limit: 10,
        //raw: true,
      });

      const newProducts = products.map((product) => ({
        ...product.toJSON(), // Chuyển Sequelize object về JSON
        discountPrice: product.price * (1 - product.sale / 100), // Giảm giá
      }));

      return {products: newProducts};
    } catch (error) {
      console.error("Lỗi lấy sản phẩm mới:", error);
      return [];
    }
  }

  async searchProducts(req, res) {
    try {
      const { q, sort, page = 1 } = req.query; 
      const limit = 10; // Số sản phẩm mỗi trang
      const offset = (page - 1) * limit;

      // Tạo điều kiện tìm kiếm
      const whereCondition = {};
      if (q) {
        whereCondition.name = { [Op.like]: `%${q}%` }; // Tìm tên chứa từ khóa
      }

      let order = [];
      if (sort === "price-asc") order = [["price", "ASC"]];
      else if (sort === "price-desc") order = [["price", "DESC"]];
      else if (sort === "name-asc") order = [["name", "ASC"]];
      else if (sort === "name-desc") order = [["name", "DESC"]];
      else order = [['updatedAt', 'DESC']]

      // Đếm tổng số sản phẩm phù hợp
      const totalProducts = await Product.count({ where: whereCondition });

      // Lấy danh sách sản phẩm
      const products = await Product.findAll({
        where: whereCondition,
        limit,
        offset,
        order: order,
        raw: true,
      });

      // Tính tổng số trang
      const totalPages = Math.ceil(totalProducts / limit);

      // Render kết quả tìm kiếm
      res.render("search", {
        products,
        currentPage: page,
        totalPages,
        query: q,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Lỗi server");
    }
  }

  // lấy chi tiết sản phẩm
  async getProduct(req, res) {
    try {
      const { slug } = req.params;
      const product = await Product.findOne({ where: { slug }, raw: true });
      if (!product) {
        return res.status(404).send("Product not found");
      }

      res.render("product/productInfo", { product });
    } catch (error) {
      console.error("Lỗi lấy chi tiết sản phẩm:", error);
      res.status(500).send("Lỗi server");
    }
  }
}
module.exports = new ProductController();
