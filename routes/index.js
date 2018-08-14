let express = require('express');
let router = express.Router();
let csrf = require('csurf');
let csrfProtection = csrf({cookie: true});

// Send CSRF token for session
if (process.env.APP_ENV !== 'test') {
	router.use(csrfProtection, [(req, res, next) => {
		res.header('csrfToken', req.csrfToken());
		next();
	}]);
}

router.use('/auth', require('./auth'));
router.use('/marker', require('./marker'));

module.exports = router;
