let jwtService = require('../services/JwtService');

module.exports = function (req, res, next) {
	let token = req.headers.jwt;
	let user = jwtService.verify(token);
	if (user) {
		req.user = user;
		next();
	} else {
		res.status(403)
			.json({message: "Access forbidden."})
	}
};