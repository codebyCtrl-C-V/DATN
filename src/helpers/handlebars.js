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