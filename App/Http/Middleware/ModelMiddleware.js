import Media from '../../Models/Media.js';
import Marker from '../../Models/Marker.js';
import User from '../../Models/User.js';
import Story from '../../Models/Story.js';
import BaseError from '../../Errors/BaseError.js';

const models = {
	Marker,
	Media,
	User,
	Story
};

class ModelMiddleware {
	inject(keys = {}) {
		return async (req, res, next) => {
			req.objects = {};
			for (let prop in req.params) {
				if (req.params[prop]) {
					const className = prop.charAt(0).toUpperCase() + prop.substring(1);
					if (models[className] !== undefined) {
						const key = keys[className] || 'id';
						const condition = {};
						condition[key] = req.params[prop];

						try {
							req.objects[prop] = await models[className].findOne({
								where: condition
							});
							if (!req.objects[prop]) {
								throw new BaseError('Not Found', 404);
							}
						} catch (error) {
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
			if (!req.user || (req.objects[object] && req.objects[object][key] !== req.user.id)) {
				throw new BaseError('Forbidden', 403);
			}
			next();
		}
	}
}

export default new ModelMiddleware();
