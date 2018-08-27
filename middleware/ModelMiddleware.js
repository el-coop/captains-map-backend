const Media = require('../models/Media');
const Marker = require('../models/Marker');

const models = {
	Marker,
	Media
}

class ModelMiddleware {
	async inject(req, res, next) {
		req.objects = {};
		for (let prop in req.params) {
			let className = prop.charAt(0).toUpperCase() + prop.substr(1);
			if (models[className] !== undefined) {
				req.objects[prop] = await new models[className]({id: req.params[prop]}).fetch();
			}
		}
		next();
	}

	valdiateOwnership(object) {
		return (req, res, next) => {
			if (req.objects[object].user_id !== req.user.id) {
				res.status(403).json({'Error': 'Forbidden'});
				return false;
			}
			next();
		}
	}
}

module.exports = new ModelMiddleware();