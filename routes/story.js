import express from 'express';
import StoryController from '../App/Http/Controllers/StoryController.js';
import authMiddleware from '../App/Http/Middleware/AuthMiddleware.js';
import validation from '../App/Http/Middleware/ValidationMiddleware.js';
import modelMiddleware from '../App/Http/Middleware/ModelMiddleware.js';

const router = express.Router();

router.get('/:user/:story', [
	modelMiddleware.inject({
		User: 'username'
	}),
], StoryController.get);


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
		name: ['required', 'string'],
		published: ['required', 'in:0,1']
	})
], StoryController.edit);

router.delete('/:story', [
	authMiddleware,
	modelMiddleware.inject(),
	modelMiddleware.valdiateOwnership('story')
], StoryController.destroy.bind(StoryController));

export default router;
