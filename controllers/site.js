'use strict';

class SiteController {
	csurf(req, res) {
		return res.json({csrfToken: req.csrfToken()});
	}
}


module.exports = new SiteController();