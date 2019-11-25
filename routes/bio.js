const router = require('express').Router();
const validation = require('../App/Http/Middleware/ValidationMiddleware');
const upload = require('../App/Http/Middleware/UploadMiddleware');
const authMiddleware = require('../App/Http/Middleware/AuthMiddleware');
const modelMiddleware = require('../App/Http/Middleware/ModelMiddleware');
const BioController = require('../App/Http/Controllers/BioController');


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

module.exports = router;
