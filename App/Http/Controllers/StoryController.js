import StoryRepository from '../../Repositories/StoryRepository.js';
import Cache from '../../Services/CacheService.js';
import Marker from '../../Models/Marker.js';
import fs from 'fs';
import path from 'path';
import url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const deleteMarker = Symbol('deleteMarker');

class StoryController {
	async create(req, res) {
		const userId = req.user.get('id');
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
			!story.get('published') && (!req.user || story.get('user_id') !== req.user.get('id')) ||
			req.objects.user.get('id') !== story.get('user_id')
		) {
			return res.sendStatus(404);
		}
		const markers = await new Marker().where({story_id: story.get('id')}).fetchAll({
			columns: ['id', 'user_id', 'lat', 'lng', 'type', 'location', 'time', 'description'],
			withRelated: [
				{
					media(query) {
						return query.select('id', 'marker_id', 'type', 'path');
					},
				},

				{
					user(query) {
						return query.select('id', 'username');
					},
				},
				{
					'user.bio'(query) {
						return query.select('user_id', 'path');
					}
				}]
		});

		let cover;
		const marker = markers.at(0);
		if (marker) {
			cover = marker.related('media').at(0);
		}

		res.json({
			id: story.get('id'),
			name: story.get('name'),
			published: story.get('published'),
			user_id: story.get('user_id'),
			cover: cover ? {
				type: cover.get('type'),
				path: cover.get('path'),
			} : null,
			markers
		});
	};

	async edit(req, res) {
		const userId = req.user.get('id');
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
		const userId = req.user.get('id');
		const story = req.objects.story;
		await story.load('markers');
		const markers = story.related('markers');
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
		await marker.load('media');

		try {
			const medias = marker.related('media');
			for (let i = 0; i < medias.length; i++) {
				const media = medias.at(i);
				if (media.get('type') === 'image') {
					fs.unlinkSync(path.join(__dirname, `../../../public/${media.get('path')}`));
					if (fs.existsSync(path.join(__dirname, `../../../public/${media.get('path').replace('images', 'thumbnails')}`))) {
						fs.unlinkSync(path.join(__dirname, `../../../public/${media.get('path').replace('images', 'thumbnails')}`));
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
