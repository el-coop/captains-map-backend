import express from 'express';
const router = express.Router();
import modelMiddleware from'../App/Http/Middleware/ModelMiddleware.js';
import CrawlerController from'../App/Http/Controllers/CrawlerController.js';

router.get('/:user?/:marker?', [
	modelMiddleware.inject({
		User: 'username'
	})
], CrawlerController.index);

export default router;