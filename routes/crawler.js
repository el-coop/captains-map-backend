const express = require('express');
const router = express.Router();
const modelMiddleware = require('../middleware/ModelMiddleware');
const CrawlerController = require('../controllers/CrawlerController');

router.get('/:user?/:marker?', [
	modelMiddleware.inject({
		User: 'username'
	})
], CrawlerController.index);

module.exports = router;