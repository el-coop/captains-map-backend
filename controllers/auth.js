'use strict';

const User = require('../models/User');
const BaseController = require('./base');

class AuthController extends BaseController {
	async register(req, res) {

		if (!this.validate(req, res)) {
			return;
		}

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
}


module.exports = new AuthController();