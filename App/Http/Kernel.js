const BaseMiddleware = require('./Middleware/BaseMiddleware');
const CSRFMiddleware = require('./Middleware/CSRFMiddleware');
const express = require('express');
const cookieParser = require('cookie-parser');
const cookieEncrypter = require('cookie-encrypter');
const logger = require('morgan');
const ErrorHandlerMiddleware = require('./Middleware/ErrorHandlerMiddleware');
const InjectUserMiddleware = require('./Middleware/InjectUserMiddleware');

const preMiddleware = [
	logger('dev'),
	express.json(),
	express.urlencoded({extended: false}),
	cookieParser(process.env.COOKIE_SECRET),
	cookieEncrypter(process.env.COOKIE_SECRET),
	CSRFMiddleware,
	InjectUserMiddleware,
];

const postMiddleware = [
	ErrorHandlerMiddleware
];

class Kernel {
	constructor(app) {
		this.app = app;
	}

	registerMiddleware(middlewareList) {
		middlewareList.forEach((middleware) => {
			if (middleware.prototype instanceof BaseMiddleware) {
				new middleware(this.app);
			} else {
				this.app.use(middleware);
			}
		})
	}

	registerPreMiddleware() {
		this.registerMiddleware(preMiddleware);
	}

	registerPostMiddleware() {
		this.registerMiddleware(postMiddleware);
	}
}

module.exports = {
	boot(app) {
		return new Kernel(app);
	}
};
