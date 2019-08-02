const MakeBase = require('./BaseClasses/MakeBase');
const path = require('path');

class MakeMiddleware extends MakeBase {
	constructor() {
		super();
		this.path = path.resolve(process.cwd(), './App/Http/Middleware');
		this.stub = 'middleware';
	}
}

MakeMiddleware.signature = "make:middleware <name>";
MakeMiddleware.description = "Make a new global middleware";

module.exports = MakeMiddleware;
