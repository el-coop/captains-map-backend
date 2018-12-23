const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
const mime = require('mime');
const SharpStorage = require('../../Services/SharpStorage');

const storages = {};

const makeStorage = function (dir) {
	return multer({
		fileFilter: (req, file, callback) => {

			const filetypes = /jpeg|jpg|png|gif/;
			const mimetype = filetypes.test(file.mimetype);
			const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

			if (mimetype && extname) {
				return callback(null, true);
			}
			callback(null, false);
		},
		storage: new SharpStorage({
			destination(req, file, callback) {
				callback(null, path.join(__dirname, `../../../public/${dir}`));
			},
			filename(req, file, cb) {
				const name = crypto.randomBytes(16).toString("hex");
				cb(null, `${name}${Date.now()}.${mime.getExtension(file.mimetype)}`);
			}
		})
	})
};


module.exports = {
	image(fieldName, path, width = 1000, height = 800) {
		let imageUpload = storages[`${path}_${width}_${height}`];
		if (!imageUpload) {
			imageUpload = makeStorage(path);
			imageUpload.storage.width = width;
			imageUpload.storage.height = height;
			storages[`${path}_${width}_${height}`] = imageUpload;
		}
		return imageUpload.single(fieldName);
	}
};