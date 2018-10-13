const express = require('express');
const router = express.Router();
const modelMiddleware = require('../App/Http/middleware/ModelMiddleware');
const CrawlerController = require('../App/Http/controllers/CrawlerController');

router.get('/:user?/:marker?', [
	modelMiddleware.inject({
		User: 'username'
	})
], CrawlerController.index);

module.exports = router;