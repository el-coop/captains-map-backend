const MakeBase = require('./BaseClasses/MakeBase');
const fs = require('fs');
const chalk = require('chalk');
const path = require('path');

class MakeCommand extends MakeBase {
	constructor() {
		super();
		this.path = path.resolve(process.cwd(), './Console/Commands');
		this.stub = 'command';
	}
}

MakeCommand.signature = "make:command <name>";
MakeCommand.description = "Make a new console command";

module.exports = MakeCommand;