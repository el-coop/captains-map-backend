const Follower = require('../../Models/Follower');
const Cache = require('../../Services/CacheService');

const follow = Symbol('follow');

class FollowController {

	async following(req, res) {
		const endpoint = req.query.endpoint;
		const following = await Cache.rememberForever(endpoint, async () => {
			const result = await new Follower().where('endpoint', endpoint).fetchAll({
				columns: ['endpoint', 'user_id'],
				withRelated: [{
					user(query) {
						return query.select('id', 'username');
					},
				}]
			});

			return result.map((following) => {
				return following.$user.username;
			});
		});

		res.status(200)
			.json(following);
	}

	key(req, res) {
		res.status(200)
			.send(process.env.VAPID_PUBLIC_KEY);
	}

	async toggleFollow(req, res) {
		const user = req.objects.user;

		const subscription = await new Follower({
			user_id: user.id,
			endpoint: req.body.subscription.endpoint
		}).fetch();

		let status = 200;
		if (subscription) {
			await subscription.destroy();
		} else {
			await this[follow](req.body.subscription, user);
			status = 201;
		}

		await Cache.forget(req.body.subscription.endpoint);
		await Cache.forget(`followers_${user.id}`);

		return res.status(status)
			.json({
				success: true
			});
	}

	async [follow](subscriptionData, user) {
		const subscription = new Follower();
		subscription.user_id = user.id;
		subscription.endpoint = subscriptionData.endpoint;
		subscription.subscription = subscriptionData;
		await subscription.save();
	}

}


module.exports = new FollowController();
