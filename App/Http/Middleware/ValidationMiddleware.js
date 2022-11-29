import DataError from '../../Errors/DataError.js';
import {check, validationResult} from 'express-validator';
import NodeClam from 'clamscan';
import fs from 'fs';

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
			const fieldValidation = check(fieldName);
			let fieldRules = rules[fieldName];
			if (!Array.isArray(fieldRules)) {
				fieldRules = fieldRules.split('|');
			}
			if (!fieldRules.find((value) => {
				return value.indexOf('object') > -1;
			})) {
				fieldValidation.trim()
			}
			if (!fieldRules.find((value) => {
				return value.indexOf('required') > -1;
			})) {
				fieldValidation.optional();
			}
			fieldRules.forEach((item) => {
				const variables = item.split(':');
				const methodName = variables.shift();
				let args = [];
				if (variables.length) {
					args = variables.join(':').split(',');
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
			if (req.file) {
				fs.unlinkSync(req.file.path);
			}
			if (req.files) {
				req.files.forEach((file) => {
					fs.unlinkSync(file.path);
				});
			}
			throw new DataError('Validation Failed', 422, {errors: errors.array()}, 'Validation Error');
		}
		next();
	}

	min(args) {
		this.isLength({min: args[0]})
	}

	string() {
		this.isString();
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
		this.toDate().isISO8601();
	}

	matches(args) {
		this.matches(args[0]);
	}

	url() {
		this.isURL();
	}

	object() {
		this.custom((value) => {
			return typeof value === 'object';
		});
	}

	clamav() {
		this.custom(async (value, {req}) => {
			if (process.env.IGNORE_CLAM_SCAN === 'true') {
				return Promise.resolve();
			}
			const clamscan = await new NodeClam().init({
				removeInfected: true
			});
			let virus = false;
			if (req.file) {
				const response = await clamscan.isInfected(req.file);
				if (response.isInfected) {
					virus = true;
				}
			} else if (req.files) {
				for (const file of req.files) {
					const response = await clamscan.isInfected(file.path);

					if (response.isInfected) {
						virus = true;
					}
				}

			}

			if (virus) {
				return Promise.reject('A virus detected in upload');
			}

			return Promise.resolve()
		});
	}

	requiredIf(args, self) {
		this.if((value, {req}) => {
			let conditionValue = req.body;
			args[0].split('.').forEach((key) => {
				conditionValue = conditionValue[key];
			});

			return conditionValue === args[1];
		}).custom((value, {req}) => {
			if ((args[2] || 'body') === 'file') {
				if (!req.file && (!req.files || !req.files.length)) {
					return Promise.reject('Must upload a file');
				}
			} else if (!value) {
				return Promise.reject(`Required if ${args[0]} is ${args[1]}`);
			}
			return Promise.resolve();
		});
	}

	email() {
		this.isEmail().normalizeEmail();
	}

	debug() {
		console.log(this.builder);
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

export default new Validator;
