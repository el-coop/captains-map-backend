import User from'../../Models/User.js';
import Cache from'../../Services/CacheService.js';

class SearchController {
	async users(req, res) {
		const users = await Cache.tag(['user_search']).rememberForever(`users_${req.params.query}`, async () => {
			const result = await new User().where('username', 'like', `%${req.params.query}%`).query((qb) => {
				return qb.limit(10);
			}).fetchAll({
				columns: ['username']
			});

			return result.map((user) => {
				return user.get('username');
			});
		});

		res.status(200);
		res.json(users);
	}
}


export default new SearchController();
