import registerModels from "../Models/registerModels.js";
import BaseMiddleware from './Middleware/BaseMiddleware.js';
import CSRFMiddleware from './Middleware/CSRFMiddleware.js';
import express from 'express';
import cookieParser from 'cookie-parser';
import cookieEncrypter from 'cookie-encrypter';
import logger from 'morgan';
import ErrorHandlerMiddleware from './Middleware/ErrorHandlerMiddleware.js';
import InjectUserMiddleware from './Middleware/InjectUserMiddleware.js';

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

export default {
	boot(app) {
		return new Kernel(app);
	}
};
