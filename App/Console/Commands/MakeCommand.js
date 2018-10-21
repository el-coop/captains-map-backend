const MakeBase = require('./BaseClasses/MakeBase');
const path = require('path');

class MakeCommand extends MakeBase {
	constructor() {
		super();
		this.path = path.resolve(process.cwd(), './App/Console/Commands');
		this.stub = 'command';
	}
}

MakeCommand.signature = "make:command <name>";
MakeCommand.description = "Make a new console command";

module.exports = MakeCommand;