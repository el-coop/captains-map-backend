import BaseMiddleware from './BaseMiddleware.js';
import csurf from 'csurf';
const csrfProtection = csurf({cookie: true});

class CSRFMiddleware extends BaseMiddleware {
	constructor(router) {
		if (process.env.APP_ENV !== 'test') {
			router.use(csrfProtection);
		}
		super(router);
	}

	handle(req, res, next) {
		if (process.env.APP_ENV !== 'test') {
			res.header('csrfToken', req.csrfToken());
		}
		next();
	}
}

export default CSRFMiddleware;
