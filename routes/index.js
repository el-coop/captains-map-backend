let express = require('express');
let router = express.Router();
let csrf = require('csurf');
let csrfProtection = csrf({cookie: true});
const errorHandler = require('../middleware/ErrorHandlerMiddleware');

if (process.env.APP_ENV !== 'test') {
	router.use(csrfProtection, [(req, res, next) => {
		res.header('csrfToken', req.csrfToken());
		next();
	}]);
}

router.use('/auth', require('./auth'));
router.use('/marker', require('./marker'));
router.use('/geocode', require('./geocode'));
errorHandler(router);

module.exports = router;