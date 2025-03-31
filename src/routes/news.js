const express = require('express');
const router = express.Router();
const newsController = require('../controllers/NewsController');

router.get('/', newsController.getAllNews)
router.get('/:slug', newsController.getNews);

module.exports = router;
