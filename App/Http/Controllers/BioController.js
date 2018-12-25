const Bio = require('../../Models/Bio');
const fs = require('fs');
const path = require('path');

const getUserBio = Symbol('getUserBio');
const formatBio = Symbol('formatBio');

class BioController {
	async get(req, res) {
		const user = await req.objects.user.load('bio');
		return res.send(this[formatBio](user.$bio));
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
		}
		await bio.save();
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
			description: bio.description
		};
	}
}


module.exports = new BioController();