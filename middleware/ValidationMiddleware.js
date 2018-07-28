const {check, validationResult} = require('express-validator/check');

class Validator {
	rules(rules) {
		let validationRules = [];
		for (let fieldName in rules) {
			let fieldValidation = check(fieldName).trim();
			if (rules[fieldName].indexOf('date') === -1 && rules[fieldName].indexOf('url') === -1) {
				fieldValidation = check(fieldName).escape();
			}
			rules[fieldName].forEach((item) => {
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
		this.not().isEmpty();
	}

	in(args) {
		this.isIn(args);
	}

	numeric() {
		this.isNumeric();
	}

	date() {
		this.toDate();
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
						return Promise.reject('Invalid value');
					}
				} else if (!value) {
					return Promise.reject('Invalid value');
				}
			}
			return Promise.resolve();
		});
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