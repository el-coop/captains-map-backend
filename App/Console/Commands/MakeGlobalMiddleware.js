const MakeBase = require('./BaseClasses/MakeBase');
const path = require('path');

class MakeGlobalMiddleware extends MakeBase {
	constructor() {
		super();
		this.path = path.resolve(process.cwd(), './globalMiddleware');
		this.stub = 'middleware';
	}
}

MakeGlobalMiddleware.signature = "make:globalMiddleware <name>";
MakeGlobalMiddleware.description = "Make a new global middleware";

module.exports = MakeGlobalMiddleware;
