import Cache from '../../Services/CacheService.js';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
import Bio from '../../Models/Bio.js';
import Media from "../../Models/Media.js";
import Marker from "../../Models/Marker.js";
import sequelize from "sequelize";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getUserBio = Symbol('getUserBio');
const formatBio = Symbol('formatBio');
const getUserStories = Symbol('getUserStories');

class BioController {
	async get(req, res) {
		const user = req.objects.user;

		const bio = await Cache.rememberForever(`bio:${user.id}`, async () => {
			const bio = await this[getUserBio](user);
			return {
				path: bio.path || null,
				description: bio.description || '',
			};
		});

		const withUnpublished = req.user && user.id === req.user.id;
		const stories = await Cache.tag([`stories_user:${user.id}`]).rememberForever(`stories:${user.id}` + (withUnpublished ? '_unpublished' : ''), async () => {
			return await this[getUserStories](user, withUnpublished);
		});

		return res.json(this[formatBio](bio, stories));
	};

	async update(req, res) {
		try {
			const user = req.user;
			const bio = await this[getUserBio](user);
			bio.set('description', req.body.description);
			if (req.file) {
				const oldImage = bio.path;
				bio.set('path', `/bios/${req.file.filename}`);

				if (oldImage && fs.existsSync(path.join(__dirname, `../../../public/${oldImage}`))) {
					fs.unlinkSync(path.join(__dirname, `../../../public/${oldImage}`));
				}
				await Cache.tag(['markers', `markers_user:${user.id}`]).flush();
			}
			await bio.save();
			await Cache.forget(`bio:${user.id}`);
			return res.json({
				path: bio.path || null,
				description: bio.description || '',
			});
		} catch (e) {
			fs.unlinkSync(req.file.path);
			throw e;
		}

	}

	async [getUserBio](user) {
		let bio = await user.getBio();
		if (!bio) {
			bio = new Bio();
			bio.user_id = user.id;
		}
		return bio;
	}

	[formatBio](bio, stories) {
		return {
			...bio,
			stories
		};
	}

	async [getUserStories](user, withUnpublished) {
		const where = {};
		if (!withUnpublished) {
			where.published = true;
		}

		const stories = await user.getStories({
			attributes: {
				include: [
					[sequelize.col('Markers.Media.path'), 'cover_path'],
					[sequelize.col('Markers.Media.type'), 'cover_type'],
				]
			},
			where,
			include: [{
				attributes: [],
				model: Marker,
				include: [{
					model: Media,
					attributes: [],
				}],
			}],
			order: [['created_at', 'DESC']],
		});



		if (!stories) {
			return [];
		}

		return stories.map((story) => {
			return {
				id: story.id,
				published: story.published,
				name: story.name,
				cover: {
					type: story.dataValues.cover_type,
					path: story.dataValues.cover_path,
				}
			}
		});
	}
}


export default new BioController();
