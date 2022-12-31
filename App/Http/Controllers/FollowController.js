import Follower from '../../Models/Follower.js';
import Cache from '../../Services/CacheService.js';
import User from "../../Models/User.js";

const follow = Symbol('follow');

class FollowController {

	async following(req, res) {
		const endpoint = req.query.endpoint;
		const following = await Cache.rememberForever(endpoint, async () => {
			const result = await Follower.findAll({
				attributes: ['endpoint', 'user_id'],
				where: {
					endpoint: endpoint
				},
				include: [{
					attributes: ['id', 'username'],
					model: User,
				}]
			});

			return result.map((following) => {
				return following.User.username;
			});
		});

		res.status(200)
			.json(following);
	}

	key(req, res) {
		res.status(200)
			.json({
				key: process.env.VAPID_PUBLIC_KEY
			});
	}

	async toggleFollow(req, res) {
		const user = req.objects.user;

		const subscription = await Follower.findOne({
			where: {
				user_id: user.id,
				endpoint: req.body.subscription.endpoint
			}
		});

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


export default new FollowController();
