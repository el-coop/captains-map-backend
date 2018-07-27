'use strict';

const User = require('../models/User');

class AuthController {
	async register(req, res) {

		try {
			if (await User.count() > 0) {
				return res.status(403).json({
					'message': 'registration is closed'
				});
			}
			let user = new User();

			user.username = req.body.username;
			user.password = req.body.password;

			await user.save();

			res.status(200);
			res.json({
				success: 'true'
			});
		} catch (error) {
			res.status(500);
			res.json({
				error
			});
		}
	}

	async login(req, res) {

		try {
			let user = await new User({
				username: req.body.username
			}).fetch({
				require: true
			});

			await user.authenticate(req.body.password);

			let token = user.generateJwt();
			res.status(200);
			res.json({
				token
			});

		} catch (error) {
			res.status(403);
			return res.json({
				'message': 'Invalid  Credentials'
			});
		}
	}
}


module.exports = new AuthController();