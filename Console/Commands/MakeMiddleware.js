const MakeBase = require('./BaseClasses/MakeBase');
const fs = require('fs');
const chalk = require('chalk');
const path = require('path');

class MakeMiddleware extends MakeBase {
	constructor() {
		super();
		this.path = path.resolve(process.cwd(), './middleware');
		this.stub = 'middleware';
	}
}

MakeMiddleware.signature = "make:middleware <name>";
MakeMiddleware.description = "Make a new middleware";

module.exports = MakeMiddleware;
