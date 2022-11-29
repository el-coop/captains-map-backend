import BaseError from './BaseError.js';

export default class DataError extends BaseError {
	constructor(message, statusCode, data, name) {
		super(message, statusCode, name);
		this.data = data;
	}
};
