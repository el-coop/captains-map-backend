const User = require('../models/User');
const BaseError = require('../errors/BaseError');

class AuthController {
	async register(req, res) {
		if (await User.count() > 0) {
			throw new BaseError('Registration is closed', 403);
		}
		let user = new User();

		user.username = req.body.username;
		user.email = req.body.email;
		user.password = req.body.password;

		await user.save();

		return res.status(200).json({
			success: true
		});
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
					maxAge: process.env.LOGIN_DURATION,
					secure: process.env.APP_ENV === 'production'
				})
				.json({
					user: {
						id: user.id,
						username: user.username,
						exp: Date.now() + parseInt(process.env.LOGIN_DURATION)
					}
				});

		} catch (error) {
			throw new BaseError('Invalid Credentials', 403, 'Authorization Error');
		}
	}
}


module.exports = new AuthController();