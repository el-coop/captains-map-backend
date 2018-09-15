const express = require('express');
const router = express.Router();
const CrawlerController = require('../controllers/CrawlerController');

router.get('/', CrawlerController.index);

module.exports = router;