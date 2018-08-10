'use strict';

const User = require('../models/User');

class AuthController {
	async changePassword(req, res) {
		try {
			let user = await new User({id: 1}).fetch();
			user.password = 'I<3Avm!!11';
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
			let exp = new Date();
			exp.setDate(exp.getDate() + 7);
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
						exp: exp.getTime()
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