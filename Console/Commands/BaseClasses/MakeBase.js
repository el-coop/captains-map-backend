const fs = require('fs');
const chalk = require('chalk');
const path = require('path');

class MakeBase {
	constructor() {
		this.path = '';
		this.stub = '';
	}

	handle(name) {
		console.log(chalk.yellow(`generating ${this.path}/${name}.js`));

		try {
			let stub = fs.readFileSync(path.resolve(__dirname, '../Stubs', this.stub)).toString();
			fs.writeFileSync(`${this.path}/${name}.js`, stub.split('{{name}}').join(name));
			console.log(chalk.green(`${this.path}/${name}.js created successfully`));
		} catch (error) {
			console.log(chalk.red(`${this.path}/${name}.js creation failed with the following error`, error));
		}
	}
}

module.exports = MakeBase;