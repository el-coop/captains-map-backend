let express = require('express');
let router = express.Router();
let authMiddleware = require('../middleware/AuthMiddleware');
const csrf = require('csurf');
const csrfProtection = csrf({cookie: true});
const mime = require('mime');
const {check} = require('express-validator/check');
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');

const MarkerController = require('../controllers/marker');

const upload = multer({
	storage: multer.diskStorage({
		destination: path.join(__dirname, '../public/images'),
		filename(req, file, cb) {
			crypto.pseudoRandomBytes(16, function (err, raw) {
				cb(null, raw.toString('hex') + Date.now() + '.' + mime.getExtension(file.mimetype));
			});
		}
	})
});

router.get('/:user?', MarkerController.index);


router.post('/create', [
	csrfProtection,
	authMiddleware,
	upload.single('media'),
	check('lat').not().isEmpty(),
	check('lng').not().isEmpty(),
	check('time').not().isEmpty(),
], MarkerController.create.bind(MarkerController));

router.delete('/:marker', [
	csrfProtection,
	authMiddleware,
], MarkerController.delete);

module.exports = router;