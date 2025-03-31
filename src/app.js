const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const app = express();

// Import helper
const hbsHelpers = require("handlebars-helpers"); 
const multiHelpers = hbsHelpers();
require('./helpers/handlebars');

// Cấu hình Handlebars
app.engine('hbs', exphbs.engine({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views', 'layouts'),
    partialsDir: path.join(__dirname, 'views', 'partials'),
    helpers: multiHelpers
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

//Kết nối cơ sở dữ liệu
const db = require('./config/database');
db.Sequelize;

// Middleware xử lý file tĩnh
app.use(express.static(path.join(__dirname, 'public')));

// Middleware xử lý dữ liệu từ form
const cookieParser = require("cookie-parser");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

//Kiểm tra user đã đăng nhập chưa
const { checkLoginMiddleware } = require('./middleware/auth');
app.use(checkLoginMiddleware);

//Load danh mục sản phẩm
const getCategories = require('./middleware/getCategories');
app.use(getCategories);

// Import routes
const indexRoutes = require('./routes/index');
const productRoutes = require('./routes/product');
const loginRoutes = require('./routes/login');
const registerRoutes = require('./routes/register');
const logoutRoutes = require('./routes/logout');
const profileRoutes = require('./routes/profile');
const categoryRoutes = require('./routes/category');

app.use('/', indexRoutes);
app.use('/product', productRoutes);
app.use('/login', loginRoutes);
app.use('/register', registerRoutes);
app.use('/logout', logoutRoutes);
app.use('/profile', profileRoutes);
app.use('/category', categoryRoutes);



// Khởi động server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server chạy tại http://localhost:${PORT}`);
});