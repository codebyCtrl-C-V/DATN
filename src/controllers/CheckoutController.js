const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Order = require("../models/Order");
const OrderDetail = require("../models/OrderDetail");
const Payment = require("../models/Payment");

class CheckoutController {
  async getCheckout(req, res) {
    try {
      const userId = req.user.id;
      const cartItems = await Cart.findAll({
        where: { userId },
        include: [
          {
            model: Product,
            attributes: ["id", "name", "price", "sale", "image"],
          },
        ],
        raw: true,
        nest: true,
      });

      const formattedCart = cartItems.map((item) => {
        const product = item.Product;
        const price =
          product.sale > 0
            ? product.price - (product.price * product.sale) / 100
            : product.price;

        return {
          ...item,
          product,
          finalPrice: price,
          total: price * item.quantity,
        };
      });

      res.render("checkout", { cartItems: formattedCart });
    } catch (error) {
      console.error("Lỗi khi lấy thông tin thanh toán:", error);
      res.status(500).json({ message: "Có lỗi xảy ra" });
    }
  }

  async submitOrder(req, res) {
    try {
      const { name, phone, address, paymentMethod } = req.body;
      const userId = req.user.id;

      // Lấy thông tin giỏ hàng
      const cartItems = await Cart.findAll({
        where: { userId },
        include: [
          {
            model: Product,
            attributes: ["id", "name", "price", "sale"],
          },
        ],
      });

      if (cartItems.length === 0) {
        return res.status(400).json({ message: "Giỏ hàng trống" });
      }

      // Tính tổng tiền
      const total = cartItems.reduce((sum, item) => {
        const price = item.Product.sale > 0
          ? item.Product.price - (item.Product.price * item.Product.sale) / 100
          : item.Product.price;
        return sum + (price * item.quantity);
      }, 0);

      // Tạo đơn hàng
      const order = await Order.create({
        userId,
        name,
        phone,
        address,
        paymentMethod,
        total,
        status: 'pending'
      });

      // Tạo thông tin thanh toán
      await Payment.create({
        orderId: order.id,
        paymentMethod: paymentMethod,
        status: paymentMethod === 'cod' ? 'pending' : 'paid'
      });

      // Tạo chi tiết đơn hàng
      for (const item of cartItems) {
        const price = item.Product.sale > 0
          ? item.Product.price - (item.Product.price * item.Product.sale) / 100
          : item.Product.price;
        
        const itemTotal = price * item.quantity;

        await OrderDetail.create({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: price,
          total: itemTotal
        });
      }

      // Xóa giỏ hàng sau khi tạo đơn hàng thành công
      await Cart.destroy({ where: { userId } });

      res.redirect('/orders');
    } catch (error) {
      console.error("Lỗi khi tạo đơn hàng:", error);
      res.status(500).json({ message: "Có lỗi xảy ra khi tạo đơn hàng" });
    }
  }
}

module.exports = new CheckoutController(); 