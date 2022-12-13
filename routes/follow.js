import express from 'express';
const router = express.Router();
import FollowController from '../App/Http/Controllers/FollowController.js';
import modelMiddleware from '../App/Http/Middleware/ModelMiddleware.js';
import validation from '../App/Http/Middleware/ValidationMiddleware.js';

router.get('/', FollowController.following);
router.get('/key', FollowController.key);
router.post('/toggleFollow/:user', modelMiddleware.inject({
	User: 'username'
}), validation.validate({
	subscription: ['required', 'object'],
	'subscription.endpoint': ['required', 'url'],
	'subscription.keys': ['required', 'object'],
}), FollowController.toggleFollow.bind(FollowController));


export default router;
