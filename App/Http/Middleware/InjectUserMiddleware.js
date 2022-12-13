import jwtService from '../../Services/JwtService.js';
import User from '../../Models/User.js';
import BaseMiddleware from './BaseMiddleware.js';

class InjectUserMiddleware extends BaseMiddleware {
	constructor(router) {
		super(router);
	}

	async handle(req, res, next) {
		const {token} = req.signedCookies;
		const jwt = jwtService.verify(token);
		if (jwt) {
			const user = await new User({
				id: jwt.id
			}).fetch();
			if (jwt.exp * 1000 - Date.now() < process.env.LOGIN_DURATION * 2 / 3) {
				res.cookie('token', user.generateJwt(), {
					httpOnly: true,
					signed: true,
					maxAge: parseInt(process.env.LOGIN_DURATION),
					secure: process.env.APP_ENV === 'production',
					sameSite: true
				});
				res.header('userextend', Date.now() + parseInt(process.env.LOGIN_DURATION));
			}
			req.user = user;
		} else if (token) {
			res.clearCookie("token");
		}
		next();
	}
}

export default InjectUserMiddleware;
