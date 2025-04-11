const Cart = require("../models/Cart");
const Product = require("../models/Product");

class CartController {
  // Thêm sản phẩm vào giỏ hàng
  async addToCart(req, res) {
    try {
      const { productId, quantity } = req.body;
      const userId = req.user.id; // Lấy userId từ req.user đã được xác thực

      // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
      let cartItem = await Cart.findOne({ where: { userId, productId } });

      if (cartItem) {
        // Nếu sản phẩm đã có trong giỏ hàng, cập nhật số lượng
        cartItem.quantity += quantity;
        await cartItem.save();
      } else {
        // Nếu sản phẩm chưa có trong giỏ hàng, tạo mới
        cartItem = await Cart.create({ userId, productId, quantity });
      }

      res
        .status(200)
        .json({ message: "Thêm vào giỏ hàng thành công", cartItem });
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error);
      res.status(500).json({ message: "Có lỗi xảy ra" });
    }
  }

  async getCart(req, res) {
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

      res.render("cart", { cartItems: formattedCart });
    } catch (error) {
      console.error("Lỗi khi lấy giỏ hàng:", error);
      res.status(500).json({ message: "Có lỗi xảy ra" });
    }
  }

  async deleteCart(req, res) {
    try {
      const { id } = req.params;;

      // Xóa sản phẩm khỏi giỏ hàng
      await Cart.destroy({ where: { id } });

      res.redirect("/cart");
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm khỏi giỏ hàng:", error);
      res.status(500).json({ message: "Có lỗi xảy ra" });
    }
  }

  async updateCart(req, res) {
    try {
      const { id, quantity } = req.body;
      const userId = req.user.id;

      // Cập nhật số lượng sản phẩm trong giỏ hàng
      await Cart.update({ quantity }, { where: { id, userId } });

      res.status(200).json({ message: "Cập nhật giỏ hàng thành công" });
    } catch (error) {
      console.error("Lỗi khi cập nhật giỏ hàng:", error);
      res.status(500).json({ message: "Có lỗi xảy ra" });
    }
  }
}
module.exports = new CartController();
