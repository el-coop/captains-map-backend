import multer from 'multer';
import crypto from 'crypto';
import path from 'path';
import mime from 'mime';

import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import SharpStorage from '../../Services/SharpStorage.js';

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
		}),
		limits: {
			fieldSize: 25000000,
		}
	})
};

function getImageFolder(path, width, height) {
	let imageUpload = storages[`${path}_${width}_${height}`];
	if (!imageUpload) {
		imageUpload = makeStorage(path);
		imageUpload.storage.width = width;
		imageUpload.storage.height = height;
		storages[path] = imageUpload;
	}
	return imageUpload;
}

export default {
	image(fieldName, path, width = 1000, height = 800) {
		const imageUpload = getImageFolder(path, width, height);
		return imageUpload.single(fieldName);
	},
	images(fieldName, path, maxCount = 1000, width = 1000, height = 800) {
		const imageUpload = getImageFolder(path, width, height);
		return imageUpload.array(fieldName, maxCount);
	}
};
