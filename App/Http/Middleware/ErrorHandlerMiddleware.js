const BaseMiddleware = require('./BaseMiddleware');

class ErrorHandlerMiddleware extends BaseMiddleware {
	handle(err, req, res, next) {

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
