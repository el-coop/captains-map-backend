import MakeBase from './BaseClasses/MakeBase.js';
import path from 'path';

class MakeCommand extends MakeBase {
	constructor() {
		super();
		this.path = path.resolve(process.cwd(), './App/Console/Commands');
		this.stub = 'command';
	}
}

MakeCommand.signature = "make:command <name>";
MakeCommand.description = "Make a new console command";

export default MakeCommand;