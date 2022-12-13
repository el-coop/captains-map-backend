import User from'../../Models/User.js';
import Cache from '../../Services/CacheService.js';

import BaseError from '../../Errors/BaseError.js';

class AuthController {
	async register(req, res) {
		if (await User.count() > 0) {
			throw new BaseError('Registration is closed', 403, 'Registration Error');
		}
		let user = new User();

		user.set('username', req.body.username);
		user.set('email', req.body.email);
		user.set('password', req.body.password);

		await user.save();
		await Cache.tag(['user_search']).flush();

		return res.status(200).json({
			success: true
		});
	}

	async login(req, res) {

		try {
			const user = await new User({
				username: req.body.username
			}).fetch();

			await user.authenticate(req.body.password);

			const token = user.generateJwt();
			res.status(200)
				.cookie('token', token, {
					httpOnly: true,
					signed: true,
					maxAge: parseInt(process.env.LOGIN_DURATION),
					secure: process.env.APP_ENV === 'production',
					sameSite: true
				})
				.json({
					user: {
						id: user.get('id'),
						username: user.get('username'),
						exp: Date.now() + parseInt(process.env.LOGIN_DURATION)
					}
				});

		} catch (error) {
			throw new BaseError('Invalid Credentials', 403, 'Authorization Error');
		}
	}

	logout(req, res) {
		res.clearCookie("token");
		res.status(200).json({status: 'success'})
	}
}


export default new AuthController();
