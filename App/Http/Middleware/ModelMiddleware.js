const Media = require('../../models/Media');
const Marker = require('../../models/Marker');
const User = require('../../models/User');
const BaseError = require('../../errors/BaseError');

const models = {
	Marker,
	Media,
	User
};

class ModelMiddleware {
	inject(keys = {}) {
		return async (req, res, next) => {
			req.objects = {};
			for (let prop in req.params) {
				if (req.params[prop]) {
					let className = prop.charAt(0).toUpperCase() + prop.substr(1);
					if (models[className] !== undefined) {
						const key = keys[className] || 'id';
						const condition = {};
						condition[key] = req.params[prop];

						let model = await new models[className](condition).fetch();
						if (!model) {
							throw new BaseError('Not Found', 404);
						}
						req.objects[prop] = await new models[className](condition).fetch();
					}
				}
			}
			next();
		}
	}

	valdiateOwnership(object) {
		return (req, res, next) => {
			if (!req.user || req.objects[object].user_id !== req.user.id) {
				res.status(403).json({Error: 'Forbidden'});
				return false;
			}
			next();
		}
	}
}

module.exports = new ModelMiddleware();