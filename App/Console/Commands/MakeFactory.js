import MakeBase from './BaseClasses/MakeBase.js';
import path from 'path';
import chalk from 'chalk';
import fs from 'fs';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MakeFactory extends MakeBase {
	constructor() {
		super();
		this.path = path.resolve(process.cwd(), './database/factories');
		this.stub = 'factory';
	}

	handle(name, model) {
		console.log(chalk.yellow(`generating ${this.path}/${name}.js`));

		try {
			this.ensureDirExistence(name);
			let stub = fs.readFileSync(path.resolve(__dirname, './Stubs', this.stub)).toString();
			fs.writeFileSync(`${this.path}/${name}.js`, stub.split('{{name}}').join(name.substring(name.lastIndexOf('/') + 1)).split('{{model}}').join(model));
			console.log(chalk.green(`${this.path}/${name}.js created successfully`));
			this.open(`${this.path}/${name}.js`);
		} catch (error) {
			console.log(chalk.red(`${this.path}/${name}.js creation failed with the following error`, error));
		}
	}

}

MakeFactory.signature = "make:factory <name> <model>";
MakeFactory.description = "Make a new factory";

export default MakeFactory;
