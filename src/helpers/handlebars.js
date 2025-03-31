const Handlebars = require('handlebars');

// Đăng ký helper formatDate
Handlebars.registerHelper('formatDate', function (date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('vi-VN', options);
});