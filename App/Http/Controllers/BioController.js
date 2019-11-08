const Cache = require('../../Services/CacheService');
const fs = require('fs');
const path = require('path');

const getUserBio = Symbol('getUserBio');
const formatBio = Symbol('formatBio');

class BioController {
	async get(req, res) {
		const user = req.objects.user;

		const bio = await Cache.rememberForever(`bio:${user.get('id')}`, async () => {
			const bio = await this[getUserBio](user);
			return this[formatBio](bio);
		});
		return res.send(bio);
	};

	async update(req, res) {
		try {
			const user = req.user;
			const bio = await this[getUserBio](user);
			bio.set('description', req.body.description);
			if (req.file) {
				const oldImage = bio.get('path');
				bio.set('path', `/bios/${req.file.filename}`);

				if (oldImage && fs.existsSync(path.join(__dirname, `../../../public/${oldImage}`))) {
					fs.unlinkSync(path.join(__dirname, `../../../public/${oldImage}`));
				}
				await Cache.tag(['markers', `markers_user:${user.get('id')}`]).flush();
			}
			await bio.save();
			await Cache.forget(`bio:${user.get('id')}`);
			return res.send(this[formatBio](bio));
		} catch (e) {
			fs.unlinkSync(req.file.path);
			throw e;
		}

	}

	async [getUserBio](user) {
		await user.load('bio');
		let bio = user.related('bio');
		if (!bio) {
			bio = new Bio();
			bio.user_id = user.id;
		}
		return bio;
	}

	[formatBio](bio) {
		return {
			path: bio.get('path') || null,
			description: bio.get('description') || ''
		};
	}
}


module.exports = new BioController();
