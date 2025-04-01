const Category = require("../models/Category");
const Product = require("../models/Product");
const User = require("../models/User");
const News = require("../models/News");
const Order = require("../models/Order");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

dotenv.config();
const slugify = require("slugify");

class AdminController {
  //dashboard
  async dashboard(req, res) {
    try {
      const totalProducts = await Product.count();
      const totalOrders = await Order.count();
      const totalUsers = await User.count();

      res.render("admin/dashboard", {
        layout: "admin",
        totalProducts,
        totalOrders,
        totalUsers,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Lỗi server");
    }
  }

  // Quản lý user
  async getUsers(req, res) {
    try {
      const users = await User.findAll({ raw: true });
      res.render("admin/user/show", { layout: "admin", users });
    } catch (error) {
      console.error(error);
      res.status(500).send("Lỗi server");
    }
  }

  async createUser(req, res) {
    const { name, email, password, phone, address, role } = req.body;

    try {
      // Kiểm tra email đã tồn tại chưa
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.redirect("/admin/user?error=1");
      }

      // Mã hóa mật khẩu
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS);
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Tạo user mới
      const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
        phone,
        address,
        role,
      });

      return res.redirect("/admin/user?success=1");
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Lỗi server!" });
    }
  }

  async updateUser(req, res) {
    try {
      const { id, name, email, phone, address, role } = req.body;

      const user = await User.findByPk(id);
      if (!user) return res.status(404).send("Không tìm thấy người dùng");

      await user.update({ name, email, phone, address, role });
      res.redirect("/admin/user");
    } catch (error) {
      console.error(error);
      res.status(500).send("Lỗi server khi cập nhật người dùng");
    }
  }

  async deleteUser(req, res) {
    try {
      const { id } = req.body;
      const user = await User.findByPk(id);
      if (!user) return res.status(404).send("Không tìm thấy người dùng");

      await user.destroy();
      res.redirect("/admin/user");
    } catch (error) {
      console.error(error);
      res.status(500).send("Lỗi server khi xóa người dùng");
    }
  }

  //quản lí product
  async getProducts(req, res) {
    try {
      const products = await Product.findAll({ raw: true });
      res.render("admin/product/show", { layout: "admin", products });
    } catch (error) {
      console.error(error);
      res.status(500).send("Lỗi server");
    }
  }

  async createProduct(req, res) {
    const { name, price, stock, description, category_id } = req.body;
    try {
      // Kiểm tra sản phẩm đã tồn tại chưa
      const existingProduct = await Product.findOne({ where: { name } });
      if (existingProduct) {
        return res.redirect("/admin/product?error=1");
      }

      // Tạo sản phẩm mới
      await Product.create({ name, price, stock, description, category_id });
      return res.redirect("/admin/product?success=1");
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Lỗi server!" });
    }
  }

  async updateProduct(req, res) {
    try {
      const { id, name, price, stock, description, category_id } = req.body;
      const product = await Product.findByPk(id);
      if (!product) return res.status(404).send("Không tìm thấy sản phẩm");

      await product.update({ name, price, stock, description, category_id });
      res.redirect("/admin/product");
    } catch (error) {
      console.error(error);
      res.status(500).send("Lỗi server khi cập nhật sản phẩm");
    }
  }

  async deleteProduct(req, res) {
    try {
      const { id } = req.body;
      const product = await Product.findByPk(id);
      if (!product) return res.status(404).send("Không tìm thấy sản phẩm");

      await product.destroy();
      res.redirect("/admin/product");
    } catch (error) {
      console.error(error);
      res.status(500).send("Lỗi server khi xóa sản phẩm");
    }
  }
}

module.exports = new AdminController();
