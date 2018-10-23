const {check, validationResult} = require('express-validator/check');

class Validator {
	validate(rules) {
		return [
			this.rules(rules),
			this.verify
		]
	}

	rules(rules) {
		const validationRules = [];
		for (let fieldName in rules) {
			const fieldValidation = check(fieldName).trim();
			let fieldRules = rules[fieldName];
			if (!Array.isArray(fieldRules)) {
				fieldRules = fieldRules.split('|');
			}
			if (fieldRules.indexOf('required') < 0) {
				fieldValidation.optional();
			}
			fieldRules.forEach((item) => {
				const variables = item.split(':');
				const methodName = variables[0];
				let args = [];
				if (variables.length > 1) {
					args = variables[1].split(',');
				}
				this[methodName].call(fieldValidation, args, this);
			});
			validationRules.push(fieldValidation);
		}
		return validationRules;
	}

	verify(req, res, next) {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(422).json({errors: errors.array()});
		}
		next();
	}

	min(args) {
		this.isLength({min: args[0]})
	}

	required() {
		this.exists().not().isEmpty();
	}

	in(args) {
		this.isIn(args);
	}

	numeric() {
		this.isNumeric();
	}

	date() {
		this.isISO8601().toDate();
	}

	matches(args) {
		this.matches(args[0]);
	}

	url() {
		this.isURL();
	}

	requiredIf(args, self) {
		this.custom((value, {req}) => {
			if (self.findFieldValue(req.body, args[0]) === args[1]) {
				if ((args[2] || 'body') === 'file') {
					if (!req.file) {
						return Promise.reject('Must upload a file');
					}
				} else if (!value) {
					return Promise.reject(`Required if ${args[0]} is ${args[1]}`);
				}
			}
			return Promise.resolve();
		});
	}

	email() {
		this.isEmail().normalizeEmail();
	}

	findFieldValue(src, path) {
		path = path.split('.');
		let result = src;
		path.forEach((item) => {
			result = result[item];
		});
		return result;
	}
}

module.exports = new Validator;