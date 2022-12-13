import express from 'express';
const router = express.Router();
import ThumbnailController from '../App/Http/Controllers/ThumbnailController.js';

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

export default router;