function ErrorHandlerMiddleware(err, req, res, next) {
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

module.exports = function (router) {
	if (router) {
		router.use(ErrorHandlerMiddleware);
	}
	return ErrorHandlerMiddleware;
};