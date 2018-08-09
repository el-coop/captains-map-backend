let jwtService = require('../services/JwtService');

module.exports = function (req, res, next) {
	const {token} = req.signedCookies;
	let user = jwtService.verify(token);
	if (user) {
		req.user = user;
		next();
	} else {
		res.status(403)
			.clearCookie("token")
			.json({
				message: "No user.",
				clearToken: true
			})
	}
};