const dotenv = require('dotenv');
dotenv.config();

const vnpayConfig = {
    vnp_TmnCode: process.env.VNPAY_TMN_CODE, // Mã website của bạn trên VNPAY
    vnp_HashSecret: process.env.VNPAY_HASH_SECRET, // Chuỗi bí mật
    vnp_Url: process.env.VNPAY_URL, // URL thanh toán VNPAY
    vnp_ReturnUrl: process.env.VNPAY_RETURN_URL, // URL trả về sau khi thanh toán
    vnp_ApiUrl: process.env.VNPAY_API_URL,
    vnp_Version: process.env.VNPAY_VERSION,
    vnp_Command: process.env.VNPAY_COMMAND,
    vnp_Locale: process.env.VNPAY_LOCALE,
    vnp_CurrCode: process.env.VNPAY_CURR_CODE,
    vnp_OrderType: process.env.VNPAY_ORDER_TYPE
};

module.exports = vnpayConfig; 