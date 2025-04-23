const Category = require("../models/Category");
const Product = require("../models/Product");
const User = require("../models/User");
const News = require("../models/News");
const Order = require("../models/Order");
const OrderDetail = require("../models/OrderDetail");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const { Op } = require('sequelize');
const fs = require('fs');
const sequelize = require('sequelize');
const Payment = require("../models/Payment");
const cloudinary = require('../config/cloudinary');

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
      const page = parseInt(req.query.page) || 1;
      const limit = 10; // 10 user mỗi trang
      const offset = (page - 1) * limit;

      const { count, rows: users } = await User.findAndCountAll({
        limit,
        offset,
        raw: true
      });

      const totalPages = Math.ceil(count / limit);

      res.render("admin/user/show", {
        layout: "admin",
        users,
        currentPage: page,
        totalPages,
        limit,
        success: req.query.success,
        error: req.query.error
      });
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

  async searchUser(req, res) {
    try {
      const { q } = req.query;
      const page = parseInt(req.query.page) || 1;
      const limit = 10;
      const offset = (page - 1) * limit;

      const whereCondition = {
        [Op.or]: [
          { name: { [Op.like]: `%${q}%` } },
          { email: { [Op.like]: `%${q}%` } },
        ]
      };

      const { count, rows: users } = await User.findAndCountAll({
        where: whereCondition,
        limit,
        offset,
        raw: true
      });

      const totalPages = Math.ceil(count / limit);

      res.render("admin/user/show", {
        layout: "admin",
        users,
        currentPage: page,
        totalPages,
        limit,
        search: q,
        success: req.query.success,
        error: req.query.error
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Lỗi server khi tìm kiếm người dùng");
    }
  }

  //quản lí product
  async getProducts(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 10; // 10 sản phẩm mỗi trang
      const offset = (page - 1) * limit;

      const { count, rows: products } = await Product.findAndCountAll({
        limit,
        offset,
        raw: true
      });

      const totalPages = Math.ceil(count / limit);

      // Lấy danh sách danh mục cho select box
      const categories = await Category.findAll({ raw: true });

      res.render("admin/product/show", {
        layout: "admin",
        products,
        categories,
        currentPage: page,
        totalPages,
        limit,
        success: req.query.success,
        error: req.query.error
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Lỗi server");
    }
  }

  async createProduct(req, res) {
    const { name, price, stock, description, category_id, sale } = req.body;
    try {
      // Kiểm tra sản phẩm đã tồn tại chưa
      const existingProduct = await Product.findOne({ 
        where: { 
          name: name 
        } 
      });
      
      if (existingProduct) {
        return res.redirect("/admin/product?error=1");
      }

      // Tạo slug từ name
      const slug = slugify(name, { lower: true, strict: true });

      // Xử lý upload ảnh
      let imageUrl = null;
      if (req.file && req.file.path) {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'products'
        });
        imageUrl = result.secure_url;
  
        // Xoá file tạm
        fs.unlinkSync(req.file.path);
      }

      // Tạo sản phẩm mới
      const newProduct = await Product.create({ 
        name, 
        slug,
        price, 
        stock, 
        description, 
        category_id,
        sale: sale || 0,
        image: imageUrl 
      });

      if (!newProduct) {
        return res.redirect("/admin/product?error=4");
      }
      
      return res.redirect("/admin/product?success=1");
    } catch (error) {
      console.error(error);
      return res.redirect("/admin/product?error=4");
    }
  }

  async updateProduct(req, res) {
    try {
      const { id, name, price, stock, description, category_id, sale } = req.body;
  
      const product = await Product.findByPk(id);
      if (!product) return res.redirect("/admin/product?error=6");

      let imageUrl = product.image; // giữ nguyên ảnh cũ nếu không upload ảnh mới

      // Nếu người dùng upload ảnh mới
      if (req.file && req.file.path) {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'products'
        });
        imageUrl = result.secure_url;
  
        // Xoá file tạm
        fs.unlinkSync(req.file.path);
      }

      // Cập nhật sản phẩm
      const updatedProduct = await product.update({ 
        name, 
        price, 
        stock, 
        description, 
        category_id,
        sale: sale || 0,
        image: imageUrl 
      });

      if (!updatedProduct) {
        return res.redirect("/admin/product?error=5");
      }

      res.redirect("/admin/product?success=2");
    } catch (error) {
      console.error(error);
      res.redirect("/admin/product?error=5");
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
      res.redirect("/admin/product?error=3");
    }
  }

  async searchProduct(req, res) {
    try {
      const { q } = req.query;
      const page = parseInt(req.query.page) || 1;
      const limit = 10;
      const offset = (page - 1) * limit;

      const whereCondition = {
        [Op.or]: [
          { name: { [Op.like]: `%${q}%` } },
        ]
      };

      const { count, rows: products } = await Product.findAndCountAll({
        where: whereCondition,
        limit,
        offset,
        raw: true,
      });

      const totalPages = Math.ceil(count / limit);

      // Lấy danh sách danh mục cho select box
      const categories = await Category.findAll({ raw: true });

      res.render("admin/product/show", {
        layout: "admin",
        products,
        categories,
        currentPage: page,
        totalPages,
        limit,
        search: q,
        success: req.query.success,
        error: req.query.error
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Lỗi server khi tìm kiếm sản phẩm");
    }
  }

  // Quản lý đơn hàng
  async getOrders(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 10; // 10 đơn hàng mỗi trang
      const offset = (page - 1) * limit;
      const status = req.query.status || 'all';

      // Tạo điều kiện where dựa trên status
      const whereCondition = {};
      if (status !== 'all') {
        whereCondition.status = status;
      }

      const { count, rows: orders } = await Order.findAndCountAll({
        where: whereCondition,
        include: [
          {
            model: User,
            attributes: ['name', 'email', 'phone']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset,
        raw: true,
        nest: true
      });

      const totalPages = Math.ceil(count / limit);

      res.render("admin/order/show", {
        layout: "admin",
        orders,
        currentPage: page,
        totalPages,
        limit,
        currentStatus: status,
        success: req.query.success,
        error: req.query.error
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Lỗi server");
    }
  }

  async getOrderDetail(req, res) {
    try {
      const { id } = req.params;
      
      const order = await Order.findOne({
        where: { id },
        raw: true,
        nest: true
      });


      if (!order) {
        return res.status(404).send("Không tìm thấy đơn hàng");
      }

      // Lấy tất cả OrderDetails riêng biệt
      const orderDetails = await OrderDetail.findAll({
        where: { orderId: id },
        include: [Product],
        raw: true,
        nest: true
      });

      res.render("admin/order/detail", {
        layout: "admin",
        order,
        orderDetails
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Lỗi server");
    }
  }

  async updateOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const order = await Order.findByPk(id);
      if (!order) {
        return res.status(404).send("Không tìm thấy đơn hàng");
      }

      await order.update({ status });
      res.redirect("/admin/orders?success=1");
    } catch (error) {
      console.error(error);
      res.status(500).send("Lỗi server khi cập nhật trạng thái đơn hàng");
    }
  }

  async searchOrders(req, res) {
    try {
      const { q } = req.query;   
      //Tìm kiếm theo id
      const whereCondition = {
        id: q
      };

      const order = await Order.findOne({
        where: whereCondition,
        include: [
          {
            model: User,
            attributes: ['name', 'email', 'phone']
          }
        ],
        raw: true,
        nest: true
      });

      res.render("admin/order/search", {
        layout: "admin",
        order,
        search: q,
        success: req.query.success,
        error: req.query.error
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Lỗi server khi tìm kiếm đơn hàng");
    }
  }

  async getOrderStatistics(req, res) {
    try {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      // Thống kê theo trạng thái
      const statusStats = await Order.findAll({
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['status']
      });

      // Thống kê doanh thu theo tháng
      const monthlyRevenue = await Order.findAll({
        where: {
          status: 'completed',
          createdAt: {
            [Op.between]: [startOfMonth, endOfMonth]
          }
        },
        attributes: [
          [sequelize.fn('SUM', sequelize.col('total')), 'total']
        ]
      });

      // Thống kê đơn hàng theo ngày trong tháng
      const dailyOrders = await Order.findAll({
        where: {
          createdAt: {
            [Op.between]: [startOfMonth, endOfMonth]
          }
        },
        attributes: [
          [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: [sequelize.fn('DATE', sequelize.col('createdAt'))]
      });

      res.render("admin/order/statistics", {
        layout: "admin",
        statusStats,
        monthlyRevenue: monthlyRevenue[0]?.dataValues?.total || 0,
        dailyOrders
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Lỗi server khi lấy thống kê đơn hàng");
    }
  }

  //Quản lý thanh toán
  async getPayments(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 10; // 10 sản phẩm mỗi trang
      const offset = (page - 1) * limit;
      const status = req.query.status || 'all';
      const whereCondition = {};
      if (status !== 'all') {
        whereCondition.status = status;
      }

      const { count, rows: payments } = await Payment.findAndCountAll({
        where: whereCondition,
        limit,
        offset,
        order: [['updatedAt', 'DESC']],
        raw: true
      });

      const totalPages = Math.ceil(count / limit);

      res.render("admin/payment/show", {
        layout: "admin",
        payments,
        currentPage: page,
        totalPages,
        limit,
        success: req.query.success,
        error: req.query.error
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Lỗi server");
    }
  }

  async updatePaymentStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const payment = await Payment.findByPk(id);
      if (!payment) {
        return res.status(404).send("Không tìm thấy thanh toán");
      }

      await payment.update({ status });
      res.redirect("/admin/payment?success=1");
    } catch (error) {
      console.error(error);
      res.status(500).send("Lỗi server khi cập nhật trạng thái thanh toán");
    }
  }

  async searchPayment(req, res) {
    try {
      const { q } = req.query;
      const whereCondition = {
          orderId: q
      };

      const payment = await Payment.findOne({
        where: whereCondition,
        raw: true
      });

      if (!payment) {
        return res.redirect("/admin/payment?error=1");
      }

      res.render("admin/payment/search", {
        layout: "admin",
        payment,
        search: q,
        success: req.query.success,
        error: req.query.error
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Lỗi server khi tìm kiếm thanh toán");
    }
  }

  //Quản lý danh mục
  async getCategories(req, res) {
    try {
      const categories = await Category.findAll({ raw: true });
      res.render("admin/category/show", {
        layout: "admin",
        categories,
        success: req.query.success,
        error: req.query.error
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Lỗi server khi lấy danh mục");
    }
  }

  async createCategory(req, res) {
    const { name } = req.body;
    try {
      const existingCategory = await Category.findOne({ where: { name } });
      if (existingCategory) {
        return res.redirect("/admin/categories?error=1");
      }

      const slug = slugify(name, { lower: true, strict: true });

      await Category.create({ name, slug });
      res.redirect("/admin/categories?success=1");
    } catch (error) {
      console.error(error);
      res.status(500).send("Lỗi server khi tạo danh mục");
    }
  }

  async updateCategory(req, res) {
    const { id, name, slug } = req.body;
    try {
      const category = await Category.findByPk(id);
      if (!category) {
        return res.redirect("/admin/categories?error=2");
      }

      await category.update({ name, slug });
      res.redirect("/admin/categories?success=2");
    } catch (error) {
      console.error(error);
      res.status(500).send("Lỗi server khi cập nhật danh mục");
    }
  }

  async deleteCategory(req, res) {
    const { id } = req.body;
    try {
      const category = await Category.findByPk(id);
      if (!category) {
        return res.redirect("/admin/categories?error=3");
      }

      await category.destroy();
      res.redirect("/admin/categories?success=3");
    } catch (error) {
      console.error(error);
      res.status(500).send("Lỗi server khi xóa danh mục");
    }
  }


}

module.exports = new AdminController();
