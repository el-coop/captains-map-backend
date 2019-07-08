const fs = require('fs');
const sharp = require('sharp');
const mkdirp = require('mkdirp');
const os = require('os');
const path = require('path');
const crypto = require('crypto');

function getDestination(req, file, cb) {
	cb(null, os.tmpdir())
}

function getFilename(req, file, cb) {
	crypto.pseudoRandomBytes(16, function (err, raw) {
		cb(err, err ? undefined : raw.toString('hex'))
	})
}

class SharpStorage {
	constructor(opts) {
		this.getFilename = (opts.filename || getFilename);

		if (typeof opts.destination === 'string') {
			mkdirp.sync(opts.destination);
			this.getDestination = function ($0, $1, cb) {
				cb(null, opts.destination);
			}
		} else {
			this.getDestination = (opts.destination || getDestination);
		}
	}

	_handleFile(req, file, cb) {
		this.getDestination(req, file, (err, destination) => {
			if (err) return cb(err);

			this.getFilename(req, file, async (err, filename) => {
				if (err) return cb(err);

				const finalPath = path.join(destination, filename);
				const transform = sharp().resize(this.width, this.height, {
					withoutEnlargement: true,
					fit: 'inside'
				});

				try {
					const outputFile = await file.stream.pipe(transform).jpeg({progressive: true}).toFile(finalPath);

					cb(null, {
						destination: destination,
						filename: filename,
						path: finalPath,
						size: outputFile.size
					});
				} catch (error) {
					return cb(error);
				}
			})
		})
	};

	_removeFile(req, file, cb) {
		const path = file.path;
		delete file.destination;
		delete file.filename;
		delete file.path;
		fs.unlink(path, cb);
	};
}


module.exports = SharpStorage;
