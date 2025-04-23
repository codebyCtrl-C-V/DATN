const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Tạo thư mục uploads nếu chưa tồn tại
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir) // Sử dụng đường dẫn tuyệt đối
    },
    filename: function (req, file, cb) {
        // Tạo tên file: timestamp + tên gốc
        cb(null, Date.now() + '-' + file.originalname)
    }
});

// Cấu hình upload
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // Giới hạn 5MB
    },
    fileFilter: function (req, file, cb) {
        // Chỉ cho phép upload file ảnh
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Chỉ cho phép upload file ảnh (JPEG, PNG, JPG)'));
        }
    }
});

module.exports = upload;
