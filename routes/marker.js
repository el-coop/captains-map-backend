let express = require('express');
let router = express.Router();
let csrf = require('csurf');
let csrfProtection = csrf({cookie: true});
const mime = require('mime');
const {check} = require('express-validator/check');
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');

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

let MarkerController = require('../controllers/marker');

router.post('/create', [
	upload.single('media'),
	csrfProtection,
	check('lat').not().isEmpty(),
	check('lng').not().isEmpty(),
	check('time').not().isEmpty(),
], MarkerController.create.bind(MarkerController));

module.exports = router;
