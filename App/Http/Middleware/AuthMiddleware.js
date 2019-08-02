const DataError = require('../../Errors/DataError');

module.exports = function (req, res, next) {

	if (!req.user) {
		res.clearCookie("token");
		throw new DataError('Forbidden', 403, {
			message: "No user.",
			clearToken: true
		});
	}
	next();
};
