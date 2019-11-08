const Media = require('../../Models/Media');
const Marker = require('../../Models/Marker');
const User = require('../../Models/User');
const BaseError = require('../../Errors/BaseError');

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
					const className = prop.charAt(0).toUpperCase() + prop.substr(1);
					if (models[className] !== undefined) {
						const key = keys[className] || 'id';
						const condition = {};
						condition[key] = req.params[prop];

						try {
							req.objects[prop] = await new models[className](condition).fetch();
						} catch (e) {
							throw new BaseError('Not Found', 404);
						}
					}
				}
			}
			next();
		}
	}

	valdiateOwnership(object, key = 'user_id') {
		return (req, res, next) => {
			if (!req.user || req.objects[object].get(key) !== req.user.get('id')) {
				throw new BaseError('Forbidden', 403);
			}
			next();
		}
	}
}

module.exports = new ModelMiddleware();
