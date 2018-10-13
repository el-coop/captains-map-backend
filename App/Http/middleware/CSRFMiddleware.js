const BaseMiddleware = require('./BaseMiddleware');
const csrfProtection = require('csurf')({cookie: true});

class CSRFMiddleware extends BaseMiddleware {
	constructor(router) {
		router.use(csrfProtection);
		super(router);
	}

	handle(req, res, next) {
		res.header('csrfToken', req.csrfToken());
		next();
	}
}

module.exports = CSRFMiddleware;