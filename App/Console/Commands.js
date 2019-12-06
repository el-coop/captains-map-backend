const program = require('commander');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

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
				.action(async (...args) => {
					await command.handle.call(command, ...args);
					process.exit();
				});
			if (commandClass.options) {
				for (let prop in commandClass.options) {
					prog.option(prop, commandClass.options[prop]);
				}
			}
		});
	}

	execute() {
		program.parse(process.argv);
		if (program.rawArgs.length < 3) {
			program.help();
		}
	}
}

module.exports = new Commands(program);
