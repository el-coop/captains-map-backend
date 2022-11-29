import DataError from '../../Errors/DataError.js';

export default function (req, res, next) {
	if (!req.user) {
		res.clearCookie("token");
		throw new DataError('Forbidden', 403, {
			message: "No user.",
			clearToken: true
		});
	}
	next();
};
