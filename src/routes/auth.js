const express = require('express');
const router = express.Router();

router.get('/login', (req, res) => {
    res.render('login', { title: 'Đăng nhập', layout: 'auth' });
});

router.get('/register', (req, res) => {
    res.render('register', { title: 'Đăng ký', layout: 'auth' });
});

module.exports = router;
