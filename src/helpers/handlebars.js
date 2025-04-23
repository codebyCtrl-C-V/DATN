const Handlebars = require("handlebars");

// Đăng ký helper formatDate
Handlebars.registerHelper("formatDate", function (date) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(date).toLocaleDateString("vi-VN", options);
});

// Đăng ký helper formatTime
Handlebars.registerHelper("formatCurrency", (value) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
});

// Đăng ký helper multiply
Handlebars.registerHelper("multiply", (a, b) => {
  return a * b;
});

// Tính tổng giá trị của giỏ hàng
Handlebars.registerHelper('calculateTotal', (cartItems) => {
  return cartItems.reduce((sum, item) => sum + item.total, 0);
});

// Helper để lấy màu cho trạng thái đơn hàng
Handlebars.registerHelper('getStatusColor', (status) => {
  const colors = {
    'pending': 'primary',
    'processing': 'warning',
    'completed': 'success',
    'cancelled': 'danger'
  };
  return colors[status] || 'secondary';
});

// Helper để lấy text cho trạng thái đơn hàng
Handlebars.registerHelper('getStatusText', (status) => {
  const texts = {
    'pending': 'Chờ xử lý',
    'processing': 'Đang xử lý',
    'completed': 'Đã hoàn tất',
    'cancelled': 'Đã hủy'
  };
  return texts[status] || status;
});

// Helper để kiểm tra có thể hủy đơn hàng không
Handlebars.registerHelper('canCancel', (status) => {
  return status === 'pending';
});

// Helper để lấy text cho phương thức thanh toán
Handlebars.registerHelper('getPaymentMethodText', (method) => {
  const texts = {
    'cod': 'Thanh toán khi nhận hàng',
    'online': 'Thanh toán online'
  };
  return texts[method] || method;
});

// Helper để định dạng tiền tệ
Handlebars.registerHelper('formatCurrency', (value) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
});

// Helper để định dạng ngày tháng
Handlebars.registerHelper('formatDate', (date) => {
  return new Date(date).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Helper để so sánh bằng nhau
Handlebars.registerHelper('eq', function(a, b) {
    return a === b;
});

// Helper để so sánh lớn hơn
Handlebars.registerHelper('gt', function(a, b) {
    return a > b;
});

// Helper để so sánh nhỏ hơn
Handlebars.registerHelper('lt', function(a, b) {
    return a < b;
});

// Helper để cộng
Handlebars.registerHelper('add', function(a, b) {
    return a + b;
});

// Helper để trừ
Handlebars.registerHelper('subtract', function(a, b) {
    return a - b;
});

// Helper để tạo mảng số từ start đến end
Handlebars.registerHelper('range', function(start, end) {
    const result = [];
    for (let i = start; i <= end; i++) {
        result.push(i);
    }
    return result;
});