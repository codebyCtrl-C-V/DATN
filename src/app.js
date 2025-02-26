const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const app = express();

// Cấu hình Handlebars
app.engine('hbs', exphbs.engine({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views', 'layouts'),
    partialsDir: path.join(__dirname, 'views', 'partials')
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

//Kết nối cơ sở dữ liệu
const db = require('./config/database');
db.Sequelize;

// Middleware xử lý file tĩnh
app.use(express.static(path.join(__dirname, 'public')));

// Middleware xử lý dữ liệu từ form
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Import routes
const indexRoutes = require('./routes/index');
const productRoutes = require('./routes/product');
const authRoutes = require('./routes/auth');
app.use('/', indexRoutes);
app.use('/product', productRoutes);
app.use('/auth', authRoutes);

// Khởi động server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server chạy tại http://localhost:${PORT}`);
});