class BaseMiddleware {
	constructor(router) {
		router.use(this.handle.bind(this));
	}

	handle() {
		throw new Error('You have to implement the handle method on middleware!');
	};
}

module.exports = BaseMiddleware;

