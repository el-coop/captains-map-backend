const StoryRepository = require('../../Repositories/StoryRepository');
const Cache = require('../../Services/CacheService');

class StoryController {
	async create(req, res) {
		const userId = req.user.get('id');
		const story = await StoryRepository.create({
			name: req.body.name,
			user_id: userId
		});

		await Cache.tag([`stories_user:${userId}`]).flush();
		res.status(200);
		res.json(story);
	}

	async edit(req, res) {
		const userId = req.user.get('id');
		const story = req.objects.story;

		await StoryRepository.update(story, {
			name: req.body.name
		});

		await Cache.tag([`stories_user:${userId}`]).flush();

		res.status(200);
		res.json(story);
	}

	async destroy(req, res) {
		const userId = req.user.get('id');
		const story = req.objects.story;
		await story.destroy();

		await Cache.tag([`stories_user:${userId}`]).flush();

		res.status(200);
		res.json({
			success: true
		});
	}
}


module.exports = new StoryController();
