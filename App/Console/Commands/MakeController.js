const MakeBase = require('./BaseClasses/MakeBase');
const path = require('path');

class MakeController extends MakeBase {
	constructor() {
		super();
		this.path = path.resolve(process.cwd(), './App/Http/Controllers');
		this.stub = 'controller';
	}
}

MakeController.signature = "make:controller <name>";
MakeController.description = "Create a controller";

module.exports = MakeController;
