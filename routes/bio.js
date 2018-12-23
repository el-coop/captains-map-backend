const router = require('express').Router();
const validation = require('../App/Http/Middleware/ValidationMiddleware');
const upload = require('../App/Http/Middleware/UploadMiddleware');
const authMiddleware = require('../App/Http/Middleware/AuthMiddleware');
const modelMiddleware = require('../App/Http/Middleware/ModelMiddleware');
const BioController = require('../App/Http/Controllers/BioController');


router.get('/:user', modelMiddleware.inject({
	User: 'username'
}), BioController.get);


router.post('/:user', [
	authMiddleware,
	modelMiddleware.inject({
		User: 'username'
	}),
	modelMiddleware.valdiateOwnership('user','id'),
	validation.validate({
		'description': 'string'
	}),
], BioController.update.bind(BioController));


router.post('/images/:user/', [
	modelMiddleware.inject({
		User: 'username'
	}),
	upload.image('bio', 'bios'),
], BioController.image.bind(BioController));

module.exports = router;
