const User = require('../../models/User');

class SearchController {
	async users(req, res) {
		let users = await new User().where('username', 'like', `%${req.params.query}%`).query((qb) => {
			return qb.limit(10);
		}).fetchAll({
			columns: ['username']
		});

		users = users.map((user) => {
			return user.username;
		});

		res.status(200);
		res.json(users);
	}
}


module.exports = new SearchController();