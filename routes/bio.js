import express from 'express';
import validation from'../App/Http/Middleware/ValidationMiddleware.js';
import upload from'../App/Http/Middleware/UploadMiddleware.js';
import authMiddleware from'../App/Http/Middleware/AuthMiddleware.js';
import modelMiddleware from'../App/Http/Middleware/ModelMiddleware.js';
import BioController from'../App/Http/Controllers/BioController.js';

const router = express.Router();

router.get('/:user', modelMiddleware.inject({
	User: 'username'
}), BioController.get.bind(BioController));


router.post('/', [
	authMiddleware,
	upload.image('image', 'bios', 200, 200),
	validation.validate({
		description: ['required','string','clamav'],
	}),
], BioController.update.bind(BioController));

export default router;
