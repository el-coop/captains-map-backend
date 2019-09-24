const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const mkdirp = require('mkdirp');

class ThumbnailController {
	async generate(req, res) {
		const filePath = path.join(__dirname, `../../../public/images/${req.params.filename}`);
		if (!fs.existsSync(filePath)) {
			return res.status(404).json({
				error: 'Not Found'
			})
		}

		const thumbnailsDir = path.join(__dirname, '../../../public/thumbnails/');
		mkdirp.sync(thumbnailsDir);
		const thumbnailPath = path.join(thumbnailsDir, req.params.filename);
		await sharp(filePath).resize(200, 200, {
			withoutEnlargement: true,
			fit: 'outside'
		}).jpeg({progressive: true}).toFile(thumbnailPath);
		sharp.cache(false);
		return res.status(200).set('Cache-Control', 'public, max-age=31536000').sendFile(thumbnailPath);
	}
}


module.exports = new ThumbnailController();
