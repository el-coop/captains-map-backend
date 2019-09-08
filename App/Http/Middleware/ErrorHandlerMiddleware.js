const BaseMiddleware = require('./BaseMiddleware');
const multer = require("multer");

class ErrorHandlerMiddleware extends BaseMiddleware {
	handle(err, req, res, next) {
		if(err instanceof multer.MulterError && err.message === 'Field value too long'){
			return res.status(422).json({
				errors: [{
					param: 'media.files',
					location: 'body',
					msg: 'Files are too big'
				}]
			});
		}

		if (process.env.NODE_ENV !== 'test') {
			console.log(err);
		}
		let data = err.data;
		if (!data) {
			data = {
				name: err.name,
				stack: err.stack,
				message: err.message
			};
		}
		if (process.env.NODE_ENV === 'production') {
			delete data.stack;
		}
		res.status(err.statusCode || 500).json(data)
	}
}

module.exports = ErrorHandlerMiddleware;
