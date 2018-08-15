'use strict';

const User = require('../models/User');

class AuthController {
	async register(req, res) {

		try {
			if (await User.count() > 0) {
				return res.status(403).json({
					'message': 'Registration is closed'
				});
			}
			let user = new User();

			user.username = req.body.username;
			user.password = req.body.password;

			await user.save();

			return res.status(200).json({
				success: true
			});
		} catch (error) {
			return res.status(500).json({
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
			res.status(200)
				.cookie('token', token, {
					httpOnly: true,
					signed: true,
					maxAge: 604800,
					secure: process.env.APP_ENV === 'production'
				})
				.json({
					user: {
						id: user.id,
						username: user.username,
						exp: Date.now() + 604800
					}
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