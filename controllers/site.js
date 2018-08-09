'use strict';

class SiteController {
	csurf(req, res) {
		return res.status(200).json({csrfToken: req.csrfToken()});
	}
}


module.exports = new SiteController();