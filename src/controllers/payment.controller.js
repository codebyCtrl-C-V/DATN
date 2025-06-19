const vnpayConfig = require("../config/vnpay.config");
const crypto = require("crypto");
const querystring = require("querystring");
const url = require("url");
const moment = require("moment"); // Dùng để format thời gian chuẩn hơn
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Order = require("../models/Order");
const OrderDetail = require("../models/OrderDetail");
const Payment = require("../models/Payment");

exports.createPaymentUrl = (req, res) => {
  try {
    // Kiểm tra dữ liệu đầu vào
    if (!req.body.amount || isNaN(req.body.amount)) {
      return res.status(400).json({ error: "Số tiền thanh toán không hợp lệ" });
    }

    // Lấy IP từ request
    let ipAddr =
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;

    // Chuyển đổi IPv6 localhost sang IPv4
    if (ipAddr === "::1") {
      ipAddr = "127.0.0.1";
    }

    const tmnCode = vnpayConfig.vnp_TmnCode;
    const secretKey = vnpayConfig.vnp_HashSecret;
    const vnpUrl = vnpayConfig.vnp_Url;
    const returnUrl = vnpayConfig.vnp_ReturnUrl;

    // Tạo mã đơn hàng theo format yêu cầu
    const orderId =
      moment().format("YYYYMMDDHHmmss") + Math.floor(Math.random() * 1000);
    const amount = parseInt(req.body.amount);
    const orderInfo = req.body.orderInfo || "Thanh toan don hang";
    //const bankCode = req.body.bankCode || null;

    if (!tmnCode || !secretKey || !vnpUrl || !returnUrl) {
      return res.status(500).json({ error: "Cấu hình VNPAY không đầy đủ" });
    }

    const createDate = moment().tz('Asia/Ho_Chi_Minh').format("YYYYMMDDHHmmss");
    const expireDate = moment().tz('Asia/Ho_Chi_Minh').add(15, "minutes").format("YYYYMMDDHHmmss");

    let vnp_Params = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: tmnCode,
      vnp_Locale: "vn",
      vnp_CurrCode: "VND",
      vnp_TxnRef: orderId,
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: "other",
      vnp_Amount: (amount * 100).toString(),
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
      vnp_ExpireDate: expireDate,
    };

    // if (bankCode) {
    //   vnp_Params["vnp_BankCode"] = bankCode;
    // }

    // Sắp xếp các tham số theo thứ tự alphabet
    vnp_Params = sortObject(vnp_Params);

    // Tạo chuỗi dữ liệu để mã hóa
    const signData = new URLSearchParams(vnp_Params).toString();

    // Tạo chữ ký
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(signData, "utf-8").digest("hex");
    vnp_Params["vnp_SecureHash"] = signed;

    // Tạo URL thanh toán
    const finalUrl = vnpUrl + "?" + new URLSearchParams(vnp_Params).toString();

    // Log chi tiết để debug
    // console.log('=== VNPAY Debug Info ===');
    // console.log('Order ID:', orderId);
    // console.log('Amount:', amount);
    // console.log('IP Address:', ipAddr);
    // console.log('Sign Data:', signData);
    // console.log('Secure Hash:', signed);
    // console.log('Payment URL:', finalUrl);
    // console.log('=======================');

     req.session.checkoutInfo = {
      name: req.body.customerName,
      phone: req.body.customerPhone,
      address: req.body.customerAddress,
    };
    req.session.userId = req.user.id;

    res.json({
      paymentUrl: finalUrl,
      orderId: orderId,
      amount: amount,
    });
  } catch (error) {
    console.error("Error creating payment URL:", error);
    res.status(500).json({ error: "Lỗi khi tạo URL thanh toán" });
  }
};

exports.vnpayReturn = async (req, res) => {
  try {
    let vnp_Params = req.query;
    const secureHash = vnp_Params["vnp_SecureHash"];

    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    vnp_Params = sortObject(vnp_Params);

    const secretKey = vnpayConfig.vnp_HashSecret;
    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    if (vnp_Params["vnp_ResponseCode"] === "00") {
      // Xử lý đơn hàng sau khi thanh toán thành công
      const userId = req.session.userId;
      const { name, phone, address } = req.session.checkoutInfo;

      if (!userId || !name || !phone || !address) {
        return res.render("payment/fail", {
          code: "99",
          message: "Không tìm thấy thông tin đơn hàng. Vui lòng thử lại.",
        });
      }

      const cartItems = await Cart.findAll({
        where: { userId },
        include: [{ model: Product }],
      });

      if (cartItems.length === 0) {
        return res.render("payment/fail", {
          code: "99",
          message: "Giỏ hàng trống. Không thể tạo đơn hàng.",
        });
      }

      const total = cartItems.reduce((sum, item) => {
        const price =
          item.Product.sale > 0
            ? item.Product.price -
              (item.Product.price * item.Product.sale) / 100
            : item.Product.price;
        return sum + price * item.quantity;
      }, 0);

      const order = await Order.create({
        userId,
        name,
        phone,
        address,
        paymentMethod: "online",
        total,
        status: "pending",
      });

      await Payment.create({
        orderId: order.id,
        paymentMethod: "online",
        status: "paid",
      });

      for (const item of cartItems) {
        const price =
          item.Product.sale > 0
            ? item.Product.price -
              (item.Product.price * item.Product.sale) / 100
            : item.Product.price;

        await OrderDetail.create({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price,
          total: price * item.quantity,
        });
      }

      await Cart.destroy({ where: { userId } });

      // Xóa session cũ
      req.session.checkoutInfo = null;

      return res.redirect("/orders");
    } else {
      // Thanh toán thất bại
      res.render("payment/fail", {
        code: vnp_Params["vnp_ResponseCode"],
        message: vnp_Params["vnp_Message"] || "Thanh toán không thành công",
      });
    }
  } catch (error) {
    console.error("Error processing VNPay return:", error);
    res.render("payment/fail", {
      code: "99",
      message: "Có lỗi xảy ra khi xử lý kết quả thanh toán",
    });
  }
};

function sortObject(obj) {
  const sortedKeys = Object.keys(obj).sort();
  const sortedObj = {};
  for (const key of sortedKeys) {
    sortedObj[key] = obj[key];
  }
  return sortedObj;
}
