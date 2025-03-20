const Product = require("../models/Product");

class ProductController {

  // Lấy danh sách sản phẩm theo category trang home
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
        order: [['price', 'ASC']],
        limit: 12,
      });
      const bestSellerWithDiscount = products.map(product => ({
        ...product.toJSON(), // Chuyển Sequelize object về JSON
        discountPrice: product.price * 0.85 // Giảm 15%
    }));

    return { products: bestSellerWithDiscount };
    } catch (error) {
      console.error("Lỗi lấy sản phẩm bán chạy:", error);
      return [];
    }
  }
}
module.exports = new ProductController;
