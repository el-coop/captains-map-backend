import StoryRepository from '../../Repositories/StoryRepository.js';
import Cache from '../../Services/CacheService.js';
import Marker from '../../Models/Marker.js';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
import Media from "../../Models/Media.js";
import User from "../../Models/User.js";
import Bio from "../../Models/Bio.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const deleteMarker = Symbol('deleteMarker');

class StoryController {
	async create(req, res) {
		const userId = req.user.id;
		const story = await StoryRepository.create({
			name: req.body.name,
			user_id: userId
		});

		await Cache.tag([`stories_user:${userId}`]).flush();
		res.status(201);
		res.json(story);
	}

	async get(req, res) {
		const story = req.objects.story;
		if (
			!story.published && (!req.user || story.user_id !== req.user.id) ||
			req.objects.user.id !== story.user_id
		) {
			return res.sendStatus(404);
		}
		const markers = await Marker.findAll({
			attributes: ['id', 'user_id', 'lat', 'lng', 'type', 'location', 'time', 'description'],
			where: {
				story_id: story.id
			},
			include: [{
				model: Media,
				attributes: ['id', 'marker_id', 'type','instagram_type', 'path'],
				as: 'media'
			},{
				model: User,
				attributes: ['id', 'username'],
				include:[{
					attributes: ['user_id', 'path'],
					model: Bio,
					as: 'bio'
				}],
				as: 'user'
			}]
		});


		let cover;
		const marker = markers[0];
		if (marker) {
			cover = marker.media[0];
		}

		res.json({
			id: story.id,
			name: story.name,
			published: story.published,
			user_id: story.user_id,
			cover: cover ? {
				type: cover.type,
				path: cover.path,
			} : null,
			markers
		});
	};

	async edit(req, res) {
		const userId = req.user.id;
		const story = req.objects.story;

		await StoryRepository.update(story, {
			name: req.body.name,
			published: req.body.published,
		});

		await Cache.tag([`stories_user:${userId}`]).flush();

		res.status(200);
		res.json(story);
	}

	async destroy(req, res) {
		const userId = req.user.id;
		const story = req.objects.story;
		const markers = await story.getMarkers({
			include: [{
				model: Media,
				as: 'media'
			}]
		});
		await story.destroy();

		for (let i = 0; i < markers.length; i++) {
			await this[deleteMarker](markers.at(i));
		}

		await Cache.tag([`stories_user:${userId}`]).flush();

		res.status(200);
		res.json({
			success: true
		});
	}

	async [deleteMarker](marker) {
		try {
			const medias = marker.media;
			for (let i = 0; i < medias.length; i++) {
				const media = medias[i];
				if (media.type === 'image') {
					fs.unlinkSync(path.join(__dirname, `../../../public/${media.path}`));
					if (fs.existsSync(path.join(__dirname, `../../../public/${media.path.replace('images', 'thumbnails')}`))) {
						fs.unlinkSync(path.join(__dirname, `../../../public/${media.path.replace('images', 'thumbnails')}`));
					}
				}
				await media.destroy()
			}

		} catch (error) {
			console.log(error);
		}

		await marker.destroy();
	}
}

export default new StoryController();
