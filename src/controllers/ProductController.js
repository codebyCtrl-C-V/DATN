const Product = require("../models/Product");

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
        order: [['sale', 'DESC']],
        limit: 10
      });
      const bestSellerWithDiscount = products.map(product => ({
        ...product.toJSON(), // Chuyển Sequelize object về JSON
        discountPrice: product.price * (1 - product.sale / 100) // Giảm giá
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
        order: [['createdAt', 'DESC']],
        limit: 10,
        raw: true
      }); 

    return products;
    } catch (error) {
      console.error("Lỗi lấy sản phẩm mới:", error);
      return [];
    }
  }

  //tạo sản phẩm
  // async createProduct(req, res) {
  //   try {
  //     const { name, description, price, stock, category_id, image } = req.body;
  //     const slug = slugify(name, { lower: true, strict: true });
  //     const news = await News.create({ title, slug, content, image });
  //   } catch (error) {
  //     console.error("Lỗi tạo tin tức:", error);
  //     res.status(500).json({ error: "Lỗi server" });
  //   }
  // }

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
module.exports = new ProductController;
