const express = require('express');
const router = express.Router();
const authMiddleware = require('../App/Http/Middleware/AuthMiddleware');
const upload = require('../App/Http/Middleware/UploadMiddleware');
const validation = require('../App/Http/Middleware/ValidationMiddleware');
const modelMiddleware = require('../App/Http/Middleware/ModelMiddleware');
const MarkerController = require('../App/Http/Controllers/MarkerController');

router.get('/', MarkerController.index.bind(MarkerController));

router.get('/instagram/:media', modelMiddleware.inject(), MarkerController.getInstagramData);

router.get('/:user/:markerId?', modelMiddleware.inject({
	User: 'username'
}), MarkerController.userMarkers.bind(MarkerController));

router.get('/:user/:markerId/previous', modelMiddleware.inject({
	User: 'username'
}), MarkerController.previousMarkers.bind(MarkerController));

router.post('/create', [
	authMiddleware,
	upload.image('media[image]', 'images'),
	validation.validate({
		lat: ['required', 'numeric'],
		lng: ['required', 'numeric'],
		time: ['required', 'date'],
		description: ['string'],
		location: ['string'],
		type: ['required', 'in:Visited,Plan,Suggestion,Other'],
		'media.type': ['required'],
		'media.path': ['requiredIf:media.type,instagram', 'url', 'matches:https:\\/\\/www\\.instagram\\.com\\/p\\/\\w*\\/.*'],
		'media.file': ['requiredIf:media.type,image,file']
	}),
], MarkerController.create.bind(MarkerController));

router.delete('/:marker', [
	authMiddleware,
	modelMiddleware.inject(),
	modelMiddleware.valdiateOwnership('marker')
], MarkerController.delete.bind(MarkerController));

module.exports = router;
