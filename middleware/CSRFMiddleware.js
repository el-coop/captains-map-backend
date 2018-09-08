let csrfProtection = require('csurf')({cookie: true});

module.exports = function (router) {
	router.use(csrfProtection, [(req, res, next) => {
		res.header('csrfToken', req.csrfToken());
		next();
	}]);
};
