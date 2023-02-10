import express from 'express';
import authMiddleware from '../App/Http/Middleware/AuthMiddleware.js';
import upload from '../App/Http/Middleware/UploadMiddleware.js';
import validation from '../App/Http/Middleware/ValidationMiddleware.js';
import modelMiddleware from '../App/Http/Middleware/ModelMiddleware.js';
import MarkerController from '../App/Http/Controllers/MarkerController.js';

const router = express.Router();


router.get('/', MarkerController.index.bind(MarkerController));

router.get('/instagram/:media', modelMiddleware.inject(), MarkerController.getInstagramData);

router.get('/:user/:markerId?', modelMiddleware.inject({
	User: 'username'
}), MarkerController.userMarkers.bind(MarkerController));

router.get('/:user/:markerId/previous', modelMiddleware.inject({
	User: 'username'
}), MarkerController.previousMarkers.bind(MarkerController));

router.post('/create/:story?', [
	authMiddleware,
	modelMiddleware.inject(),
	modelMiddleware.valdiateOwnership('story'),
	upload.images('media[files]', 'images', 5),
	validation.validate({
		lat: ['required', 'numeric'],
		lng: ['required', 'numeric'],
		time: ['required', 'date'],
		description: ['string'],
		location: ['string','max:255'],
		type: ['required', 'in:Visited,Plan,Suggestion,Other'],
		'media.type': ['required'],
		'media.path': ['requiredIf:media.type,instagram', 'url', 'matches:https:\\/\\/www\\.instagram\\.com\\/p\\/\\w*\\/.*'],
		'media.files': ['requiredIf:media.type,image,file', 'clamav']
	}),
], MarkerController.create.bind(MarkerController));

router.delete('/:marker', [
	authMiddleware,
	modelMiddleware.inject(),
	modelMiddleware.valdiateOwnership('marker')
], MarkerController.delete.bind(MarkerController));

export default router;
