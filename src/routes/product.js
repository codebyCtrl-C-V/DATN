const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('product', { title: 'Danh sách sản phẩm' });
});

module.exports = router;