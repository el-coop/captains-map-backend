import {program} from 'commander';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Commands {
	async registerCommands() {
		program
			.version('0.0.1')
			.description('Command line helpers');

		const files = fs.readdirSync(path.resolve(__dirname, './Commands'));

		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			const pathName = path.resolve(__dirname, './Commands', file);
			if (! fs.statSync(pathName).isDirectory()) {

				const commandClass = (await import(`./Commands/${file}`)).default;

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
			}
		}
	}

	execute() {
		program.parse(process.argv);
		if (program.rawArgs.length < 3) {
			program.help();
		}
	}
}

export default new Commands();
