const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/AuthMiddleware');
const csrf = require('csurf');
const csrfProtection = csrf({cookie: true});
const {check} = require('express-validator/check');
const upload = require('../middleware/FileMiddleware');
const validation = require('../middleware/ValidationMiddleware');

const MarkerController = require('../controllers/marker');

router.get('/:user?', MarkerController.index);

router.post('/create', [
	csrfProtection,
	authMiddleware,
	upload.image('media[image]'),
	validation.rules({
		lat: ['required'],
		lng: ['required'],
		time: ['required'],
		description: [],
		type: ['required', 'in:Visited,Plan,Suggestion,Other'],
		'media.type': ['required'],
		'media.path': ['requiredIf:media.type,instagram'],
		'media.file': ['requiredIf:media.type,image,file']
	}),
	validation.verify
], MarkerController.create.bind(MarkerController));

router.delete('/:marker', [
	csrfProtection,
	authMiddleware,
], MarkerController.delete.bind(MarkerController));

module.exports = router;