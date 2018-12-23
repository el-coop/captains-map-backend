const Bio = require('../../Models/Bio');

const getUserBio = Symbol('getUserBio');

class BioController {
	async get(req, res) {
		const user = await req.objects.user.load('bio');
		return res.send(user.$bio);
	};

	async update(req, res) {
		const user = await req.objects.user.load('bio');
		const bio = this[getUserBio](user);

		console.log(req);

		bio.description = req.body.description;
		await bio.save();
		return res.send(bio);
	}

	async image(req, res) {
		const user = await req.objects.user.load('bio');
		const bio = this[getUserBio](user);
		bio.path = `/bios/${req.file.filename}`;

		await bio.save();
		return res.send(bio);
	}

	[getUserBio](user) {
		let bio = user.$bio;
		if (!bio) {
			bio = new Bio();
			bio.user_id = req.objects.user.id;
		}

		return bio;
	}
}


module.exports = new BioController();