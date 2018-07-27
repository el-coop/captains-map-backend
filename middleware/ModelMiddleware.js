const Marker = require('../models/Marker');

const models = {
	Marker
}

class ModelMiddleware {
	async inject(req, res, next) {
		try {
			req.objects = {};
			for (let prop in req.params) {
				let className = prop.charAt(0).toUpperCase() + prop.substr(1);
				req.objects[prop] = await new models[className]({id: req.params[prop]}).fetch();
			}
			next();
		} catch (error) {
			console.log(error);
			res.status(500);
			res.json({
				error: 'Error'
			});
		}
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