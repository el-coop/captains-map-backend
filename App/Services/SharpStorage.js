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

function SharpStorage(opts) {
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

SharpStorage.prototype._handleFile = function (req, file, cb) {

	this.getDestination(req, file, (err, destination) => {
		if (err) return cb(err);

		this.getFilename(req, file, async (err, filename) => {
			if (err) return cb(err);

			const finalPath = path.join(destination, filename);
			const transform = sharp().withoutEnlargement().resize(1000, 800).max();

			try {
				const outputFile = await file.stream.pipe(transform).toFile(finalPath);

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

SharpStorage.prototype._removeFile = function (req, file, cb) {
	const path = file.path;

	delete file.destination;
	delete file.filename;
	delete file.path;


	fs.unlink(path, cb);
};

module.exports = function (opts) {
	return new SharpStorage(opts);
};