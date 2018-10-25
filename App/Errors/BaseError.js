module.exports = class BaseError extends Error {
	constructor(message, statusCode, name) {
		super(message);
		if (!name) {
			name = this.constructor.name;
		}
		this.name = name;
		this.statusCode = statusCode;
	}
};
