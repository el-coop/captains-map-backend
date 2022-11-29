import Cache from '../../Services/CacheService.js';
import fs from 'fs';
import path from 'path';
import url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const getUserBio = Symbol('getUserBio');
const formatBio = Symbol('formatBio');
const getUserStories = Symbol('getUserStories');

class BioController {
	async get(req, res) {
		const user = req.objects.user;

		const bio = await Cache.rememberForever(`bio:${user.get('id')}`, async () => {
			const bio = await this[getUserBio](user);
			return {
				path: bio.get('path') || null,
				description: bio.get('description') || '',
			};
		});

		const withUnpublished = req.user && user.id === req.user.id;
		const stories = await Cache.tag([`stories_user:${user.id}`]).rememberForever(`stories:${user.get('id')}` + (withUnpublished ? '_unpublished' : ''), async () => {
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
				const oldImage = bio.get('path');
				bio.set('path', `/bios/${req.file.filename}`);

				if (oldImage && fs.existsSync(path.join(__dirname, `../../../public/${oldImage}`))) {
					fs.unlinkSync(path.join(__dirname, `../../../public/${oldImage}`));
				}
				await Cache.tag(['markers', `markers_user:${user.get('id')}`]).flush();
			}
			await bio.save();
			await Cache.forget(`bio:${user.get('id')}`);
			return res.json({
				path: bio.get('path') || null,
				description: bio.get('description') || '',
			});
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

	[formatBio](bio, stories) {
		return {
			...bio,
			stories
		};
	}

	async [getUserStories](user, withUnpublished) {
		await user.load({
			stories(query) {
				query.select('stories.*', 'medias.type as cover_type', 'medias.path as cover_path')
					.leftJoin('markers', 'stories.id', 'markers.story_id')
					.leftJoin('medias', 'markers.id', 'medias.marker_id')
				if (!withUnpublished) {
					query.where('published', true);
				}
				return query.orderBy('created_at', 'DESC');
			},
		});

		return user.related('stories').map((story) => {
			const marker = story.related('markers').at(0);

			return {
				id: story.get('id'),
				published: story.get('published'),
				name: story.get('name'),
				cover: {
					type: story.get('cover_type'),
					path: story.get('cover_path'),
				}
			}
		});
	}
}


export default new BioController();
