const jwtService = require('../../Services/JwtService');
const DataError = require('../../Errors/DataError');

module.exports = function (req, res, next) {
	const {token} = req.signedCookies;
	const user = jwtService.verify(token);
	if (user) {
		req.user = user;
		next();
	} else {
		res.clearCookie("token");
		throw new DataError('Forbidden', 403, {
			message: "No user.",
			clearToken: true
		});
	}
};