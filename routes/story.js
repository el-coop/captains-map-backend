const router = require('express').Router();
const StoryController = require('../App/Http/Controllers/StoryController');
const authMiddleware = require('../App/Http/Middleware/AuthMiddleware');
const validation = require('../App/Http/Middleware/ValidationMiddleware');
const modelMiddleware = require('../App/Http/Middleware/ModelMiddleware');

router.post('/', [
	authMiddleware,
	validation.validate({
		name: 'required',
	})
], StoryController.create);

router.patch('/:story', [
	authMiddleware,
	modelMiddleware.inject(),
	modelMiddleware.valdiateOwnership('story'),
	validation.validate({
		name: 'required',
	})
], StoryController.edit);


router.delete('/:story', [
	authMiddleware,
	modelMiddleware.inject(),
	modelMiddleware.valdiateOwnership('story')
], StoryController.destroy);

module.exports = router;
