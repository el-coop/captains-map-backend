const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
const mime = require('mime');

const imageUpload = multer({
	fileFilter: (req, file, callback) => {

		let filetypes = /jpeg|jpg|png|gif/;
		let mimetype = filetypes.test(file.mimetype);
		let extname = filetypes.test(path.extname(file.originalname).toLowerCase());

		if (mimetype && extname) {
			return callback(null, true);
		}
		callback(null, false);
	},
	storage: multer.diskStorage({
		destination: path.join(__dirname, '../public/images'),
		filename(req, file, cb) {
			const name = crypto.randomBytes(16).toString("hex");
			cb(null, `${name}${Date.now()}.${mime.getExtension(file.mimetype)}`);
		}
	})
});

module.exports = {
	image(fieldName) {
		return imageUpload.single(fieldName);
	}
}