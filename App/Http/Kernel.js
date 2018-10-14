const BaseMiddleware = require('./middleware/BaseMiddleware');
const CSRFMiddleware = require('./middleware/CSRFMiddleware');
const express = require('express');
const cookieParser = require('cookie-parser');
const cookieEncrypter = require('cookie-encrypter');
const logger = require('morgan');
const ErrorHandlerMiddleware = require('./middleware/ErrorHandlerMiddleware');

const preMiddleware = [
	logger('dev'),
	express.json(),
	express.urlencoded({extended: false}),
	cookieParser(process.env.COOKIE_SECRET),
	cookieEncrypter(process.env.COOKIE_SECRET),
	CSRFMiddleware
];

const postMiddleware = [
	ErrorHandlerMiddleware
];

let instance = null;

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
	instance,
	boot(app) {
		return new Kernel(app);
	}
};
