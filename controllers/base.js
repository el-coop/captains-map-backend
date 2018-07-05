const {validationResult} = require('express-validator/check');

class BaseController {
	validate(req, res) {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			res.status(422).json({errors: errors.array()});
		}

		return errors.isEmpty();
	}
}


module.exports = BaseController;