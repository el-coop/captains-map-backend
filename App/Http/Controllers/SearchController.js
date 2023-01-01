import User from'../../Models/User.js';
import Cache from'../../Services/CacheService.js';
import {Op} from "sequelize";

class SearchController {
	async users(req, res) {
		const users = await Cache.tag(['user_search']).rememberForever(`users_${req.params.query}`, async () => {
			const result = await User.findAll({
				attributes: ['username'],
				where: {
					username: {
						[Op.like]: `%${req.params.query}%`
					}
				},
				limit: 10,
			});

			return result.map((user) => {
				return user.username;
			});
		});

		res.status(200);
		res.json(users);
	}
}


export default new SearchController();
