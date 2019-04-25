const Bio = require('../../Models/Bio');
const Cache = require('../../Services/CacheService');
const fs = require('fs');
const path = require('path');

const getUserBio = Symbol('getUserBio');
const formatBio = Symbol('formatBio');

class BioController {
	async get(req, res) {
		const user = await Cache.rememberForever(`bio:${req.objects.user.id}`, async () => {
			return await req.objects.user.load('bio');
		});
		return res.send(this[formatBio](user.$bio || user.bio));
	};

	async update(req, res) {
		const user = await req.objects.user.load('bio');
		const bio = this[getUserBio](user);
		bio.description = req.body.description;
		if (req.file) {
			const oldImage = bio.path;
			bio.path = `/bios/${req.file.filename}`;

			if (oldImage && fs.existsSync(path.join(__dirname, `../../../public/${oldImage}`))) {
				fs.unlinkSync(path.join(__dirname, `../../../public/${oldImage}`));
			}
			await Cache.tag(['markers', `markers_user:${req.user.id}`]).flush();
		}
		await bio.save();
		await Cache.forget(`bio:${req.objects.user.id}`);
		return res.send(this[formatBio](bio));
	}

	[getUserBio](user) {
		let bio = user.$bio;
		if (!bio) {
			bio = new Bio();
			bio.user_id = req.objects.user.id;
		}

		return bio;
	}

	[formatBio](bio) {
		return {
			path: bio.path || null,
			description: bio.description || ''
		};
	}
}


module.exports = new BioController();
