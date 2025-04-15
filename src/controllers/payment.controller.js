const vnpayConfig = require('../config/vnpay.config');
const crypto = require('crypto');
const querystring = require('querystring');
const url = require('url');
const moment = require('moment'); // Dùng để format thời gian chuẩn hơn

exports.createPaymentUrl = (req, res) => {
    try {
        // Kiểm tra dữ liệu đầu vào
        if (!req.body.amount || isNaN(req.body.amount)) {
            return res.status(400).json({ error: 'Số tiền thanh toán không hợp lệ' });
        }

        // Lấy IP từ request
        let ipAddr = req.headers['x-forwarded-for'] || 
                    req.connection.remoteAddress || 
                    req.socket.remoteAddress || 
                    req.connection.socket.remoteAddress;

        // Chuyển đổi IPv6 localhost sang IPv4
        if (ipAddr === '::1') {
            ipAddr = '127.0.0.1';
        }

        const tmnCode = vnpayConfig.vnp_TmnCode;
        const secretKey = vnpayConfig.vnp_HashSecret;
        const vnpUrl = vnpayConfig.vnp_Url;
        const returnUrl = vnpayConfig.vnp_ReturnUrl;

        // Tạo mã đơn hàng theo format yêu cầu
        const orderId = moment().format('YYYYMMDDHHmmss') + Math.floor(Math.random() * 1000);
        const amount = parseInt(req.body.amount);
        const orderInfo = encodeURIComponent(req.body.orderInfo || 'Thanh toan don hang');
        const bankCode = req.body.bankCode || '';

        if (!tmnCode || !secretKey || !vnpUrl || !returnUrl) {
            return res.status(500).json({ error: 'Cấu hình VNPAY không đầy đủ' });
        }

        const createDate = moment().format('YYYYMMDDHHmmss');
        const expireDate = moment().add(15, 'minutes').format('YYYYMMDDHHmmss');

        let vnp_Params = {
            vnp_Version: '2.1.0',
            vnp_Command: 'pay',
            vnp_TmnCode: tmnCode,
            vnp_Locale: 'vn',
            vnp_CurrCode: 'VND',
            vnp_TxnRef: orderId,
            vnp_OrderInfo: orderInfo,
            vnp_OrderType: 'other',
            vnp_Amount: (amount * 100).toString(),
            vnp_ReturnUrl: returnUrl,
            vnp_IpAddr: ipAddr,
            vnp_CreateDate: createDate,
            vnp_ExpireDate: expireDate
        };

        if (bankCode) {
            vnp_Params['vnp_BankCode'] = bankCode;
        }

        // Sắp xếp các tham số theo thứ tự alphabet
        vnp_Params = sortObject(vnp_Params);

        // Tạo chuỗi dữ liệu để mã hóa
        let signData = '';
        for (const key in vnp_Params) {
            if (vnp_Params[key] !== undefined && vnp_Params[key] !== null && vnp_Params[key] !== '') {
                signData += key + '=' + vnp_Params[key] + '&';
            }
        }
        signData = signData.slice(0, -1); // Xóa dấu & cuối cùng

        // Tạo chữ ký
        const hmac = crypto.createHmac("sha512", secretKey);
        const signed = hmac.update(signData, 'utf-8').digest("hex");

        vnp_Params['vnp_SecureHash'] = signed;

        // Tạo URL thanh toán
        let finalUrl = vnpUrl + '?';
        for (const key in vnp_Params) {
            if (vnp_Params[key] !== undefined && vnp_Params[key] !== null && vnp_Params[key] !== '') {
                finalUrl += key + '=' + encodeURIComponent(vnp_Params[key]) + '&';
            }
        }
        finalUrl = finalUrl.slice(0, -1); // Xóa dấu & cuối cùng

        // Log chi tiết để debug
        console.log('=== VNPAY Debug Info ===');
        console.log('Order ID:', orderId);
        console.log('Amount:', amount);
        console.log('IP Address:', ipAddr);
        console.log('Sign Data:', signData);
        console.log('Secure Hash:', signed);
        console.log('Payment URL:', finalUrl);
        console.log('=======================');

        res.json({ 
            paymentUrl: finalUrl,
            orderId: orderId,
            amount: amount
        });
    } catch (error) {
        console.error('Error creating payment URL:', error);
        res.status(500).json({ error: 'Lỗi khi tạo URL thanh toán' });
    }
};


exports.vnpayReturn = (req, res) => {
    try {
        let vnp_Params = req.query;
        const secureHash = vnp_Params['vnp_SecureHash'];

        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        vnp_Params = sortObject(vnp_Params);

        const secretKey = vnpayConfig.vnp_HashSecret;
        const signData = querystring.stringify(vnp_Params, { encode: false });
        const hmac = crypto.createHmac("sha512", secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

        if (secureHash === signed) {
            // Thanh toán thành công
            res.render('payment/success', { 
                code: vnp_Params['vnp_ResponseCode'],
                orderInfo: vnp_Params['vnp_OrderInfo'],
                amount: vnp_Params['vnp_Amount'],
                bankCode: vnp_Params['vnp_BankCode']
            });
        } else {
            // Thanh toán thất bại
            res.render('payment/fail', { 
                code: vnp_Params['vnp_ResponseCode'],
                message: 'Xác thực chữ ký không thành công'
            });
        }
    } catch (error) {
        console.error('Error processing VNPay return:', error);
        res.render('payment/fail', { 
            code: '99',
            message: 'Có lỗi xảy ra khi xử lý kết quả thanh toán'
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
