const express = require('express');
const router = express.Router();
const ThumbnailController = require('../App/Http/Controllers/ThumbnailController');

router.use('/images', express.static('./public/images', {
	immutable: true,
	maxAge: 31536000,
	setHeaders(res, path, stat) {
		res.set('Cache-Control', 'public, max-age=31536000');
	}
}));

router.use('/thumbnails', express.static('./public/thumbnails', {
	immutable: true,
	maxAge: 31536000,
	setHeaders(res, path, stat) {
		res.set('Cache-Control', 'public, max-age=31536000');
	}
}));

router.use('/bios', express.static('./public/bios', {
	immutable: true,
	maxAge: 31536000,
	setHeaders(res, path, stat) {
		res.set('Cache-Control', 'public, max-age=31536000');
	}
}));


router.get('/thumbnails/:filename', ThumbnailController.generate);

module.exports = router;