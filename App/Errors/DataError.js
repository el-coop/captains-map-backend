const BaseError = require('./BaseError');

module.exports = class DataError extends BaseError {
	constructor(message, statusCode, data, name) {
		super(message, statusCode, name);
		this.data = data;
	}
};
