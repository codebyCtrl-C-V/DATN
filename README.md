Cài đặt thư viện: npm install
Chạy chương trình: npm start
Thêm file .env:
# jwt token
JWT_SECRET=
JWT_EXPIRES=
BCRYPT_SALT_ROUNDS=

# database
DB_DIALECT=
DB_HOST=
DB_PORT=
DB_NAME=
DB_USER=
DB_PASS=

# cloudinary
CLOUD_NAME=
API_KEY=
API_SECRET=
CLOUDINARY_URL=

# vnpay
VNPAY_TMN_CODE=
VNPAY_HASH_SECRET=
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL= 
VNPAY_API_URL=https://sandbox.vnpayment.vn/merchant_webapi/api/transaction
VNPAY_VERSION=2.1.0
VNPAY_COMMAND=pay
VNPAY_LOCALE=vn
VNPAY_CURR_CODE=VND
VNPAY_ORDER_TYPE=other

# api gpt key
GEMINI_API_KEY=

# secret key
SECRET_KEY=


