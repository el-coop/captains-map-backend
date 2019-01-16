const User = require('../../Models/User');
const Cache = require('../../Services/CacheService');

class SearchController {
	async users(req, res) {
		const users = await Cache.tag(['user_search']).rememberForever(`users_${req.params.query}`, async () => {
			const result = await new User().where('username', 'like', `%${req.params.query}%`).query((qb) => {
				return qb.limit(10);
			}).fetchAll({
				columns: ['username']
			});

			return result.map((user) => {
				return user.username;
			});
		});

		res.status(200);
		res.json(users);
	}
}


module.exports = new SearchController();
