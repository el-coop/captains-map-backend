import jwt from 'jsonwebtoken';

class JwtService {

	generate(data, duration) {
		return jwt.sign(data, process.env.APP_SECRET, {
			expiresIn: duration || process.env.LOGIN_DURATION
		});
	}

	verify(token) {
		try {
			return jwt.verify(token, process.env.APP_SECRET);
		} catch (error) {
			return false;
		}
	}
}

export default new JwtService();
