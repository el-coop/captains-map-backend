const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/AuthMiddleware');
const csrf = require('csurf');
const csrfProtection = csrf({cookie: true});
const upload = require('../middleware/UploadMiddleware');
const validation = require('../middleware/ValidationMiddleware');
const modelMiddleware = require('../middleware/ModelMiddleware');

const MarkerController = require('../controllers/MarkerController');

router.get('/', MarkerController.index);
router.get('/:user', MarkerController.userMarkers);

router.get('/instagram/:id', MarkerController.getInstagramData);

router.post('/create', [
	authMiddleware,
	upload.image('media[image]'),
	validation.rules({
		lat: ['required', 'numeric'],
		lng: ['required', 'numeric'],
		time: ['required', 'date'],
		description: [],
		type: ['required', 'in:Visited,Plan,Suggestion,Other'],
		'media.type': ['required'],
		'media.path': ['requiredIf:media.type,instagram', 'url', 'matches:https:\/\/www\.instagram\.com\/p\/\w*\/.*'],
		'media.file': ['requiredIf:media.type,image,file']
	}),
	validation.verify
], MarkerController.create.bind(MarkerController));

router.delete('/:marker', [
	authMiddleware,
	modelMiddleware.inject,
	modelMiddleware.valdiateOwnership('marker')
], MarkerController.delete.bind(MarkerController));

module.exports = router;