const program = require('commander');
const fs = require('fs');
const path = require('path');

class Commands {
	constructor() {
		program
			.version('0.0.1')
			.description('Command line helpers');

		const files = fs.readdirSync(path.resolve(__dirname, './Commands'));
		files.forEach((file) => {
			const pathName = path.resolve(__dirname, './Commands', file);
			if (fs.statSync(pathName).isDirectory()) {
				return;
			}

			const commandClass = require(pathName);
			const command = new commandClass();
			let prog = program.command(commandClass.signature)
				.description(commandClass.description)
				.action(command.handle.bind(command));
			if(commandClass.options){
				for(let prop in commandClass.options){
					prog.option(prop, commandClass.options[prop]);
				}
			}
		});
	}

	execute() {
		program.parse(process.argv);
		if (program.args.length === 0) {
			program.help();
		}
	}
}

module.exports = new Commands(program);
