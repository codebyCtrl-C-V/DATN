const Order = require("../models/Order");
const OrderDetail = require("../models/OrderDetail");
const Product = require("../models/Product");

class OrderController {
  // Lấy danh sách đơn hàng của người dùng
  async getOrders(req, res) {
    try {
      const userId = req.user.id;
      const orders = await Order.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: OrderDetail,
            include: [Product]
          }
        ]
      });


      // Format lại dữ liệu đơn hàng
      const formattedOrders = orders.map(order => {
        const orderDetails = order.OrderDetails.map(detail => {
          return {
            product: {
              name: detail.Product.dataValues.name,
              image: detail.Product.dataValues.image
            },
            quantity: detail.quantity,
            price: detail.price,
            total: detail.total
          };
        });

        return {
          id: order.id,
          status: order.status,
          total: order.total,
          createdAt: order.createdAt,
          paymentMethod: order.paymentMethod,
          details: orderDetails
        };
      });

      // Phân loại đơn hàng theo trạng thái
      const pendingOrders = formattedOrders.filter(order => order.status === 'pending');
      const processingOrders = formattedOrders.filter(order => order.status === 'processing');
      const completedOrders = formattedOrders.filter(order => order.status === 'completed');
      const cancelledOrders = formattedOrders.filter(order => order.status === 'cancelled');

      res.render('order', { 
        pendingOrders,
        processingOrders,
        completedOrders,
        cancelledOrders
      });
    } catch (error) {
      console.error("Lỗi khi lấy danh sách đơn hàng:", error);
      res.status(500).json({ message: "Có lỗi xảy ra" });
    }
  }

  // Hủy đơn hàng
  async cancelOrder(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const order = await Order.findOne({ where: { id, userId } });
      
      if (!order) {
        return res.status(404).json({ message: 'Đơn hàng không tồn tại' });
      }

      if (order.status !== 'pending') {
        return res.status(400).json({ message: 'Không thể hủy đơn hàng này' });
      }

      await order.update({ status: 'cancelled' });
      res.redirect('/orders');
    } catch (error) {
      console.error("Lỗi khi hủy đơn hàng:", error);
      res.status(500).json({ message: "Có lỗi xảy ra" });
    }
  }
}

module.exports = new OrderController();