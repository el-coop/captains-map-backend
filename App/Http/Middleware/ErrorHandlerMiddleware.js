const BaseMiddleware = require('./BaseMiddleware');
const multer = require("multer");
const ErrorLogger = require("../../Services/ErrorLogger");

class ErrorHandlerMiddleware extends BaseMiddleware {
	handle(error, req, res, next) {
		if (error instanceof multer.MulterError && error.message === 'Field value too long') {
			return res.status(422).json({
				errors: [{
					param: 'media.files',
					location: 'body',
					msg: 'Files are too big'
				}]
			});
		}

		if (process.env.NODE_ENV !== 'test') {
			console.log(error);
		}
		let data = error.data;
		if (!data) {
			data = {
				name: error.name,
				stack: error.stack,
				message: error.message
			};
		}
		if (process.env.NODE_ENV === 'production') {
			delete data.stack;
		}
		res.status(error.statusCode || 500).json(data);

		if (!error.statusCode || error.statusCode === 500) {
			ErrorLogger.log(error, req);
		}
	}
}

module.exports = ErrorHandlerMiddleware;
