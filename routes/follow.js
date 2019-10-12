const router = require('express').Router();
const FollowController = require('../App/Http/Controllers/FollowController');
const modelMiddleware = require('../App/Http/Middleware/ModelMiddleware');
const validation = require('../App/Http/Middleware/ValidationMiddleware');

router.get('/', FollowController.following);
router.get('/key', FollowController.key);
router.post('/toggleFollow/:user', modelMiddleware.inject({
	User: 'username'
}), validation.validate({
	subscription: ['required', 'object'],
	'subscription.endpoint': ['required', 'url'],
	'subscription.keys': ['required', 'object'],
}), FollowController.toggleFollow.bind(FollowController));


module.exports = router;
