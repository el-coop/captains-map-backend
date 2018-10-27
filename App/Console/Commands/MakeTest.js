const MakeBase = require('./BaseClasses/MakeBase');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');


class MakeTest extends MakeBase {
	constructor() {
		super();
		this.path = path.resolve(process.cwd(), './tests/integration');
		this.stub = 'test';
	}

	handle(name, options) {
		if (typeof options.unit !== "undefined") {
			this.path = path.resolve(process.cwd(), './tests/unit');
		}

		console.log(chalk.yellow(`generating ${this.path}/${name}.spec.js`));

		try {
			let stub = fs.readFileSync(path.resolve(__dirname, './Stubs', this.stub)).toString();
			fs.writeFileSync(`${this.path}/${name}.spec.js`, stub.split('{{name}}').join(name));
			console.log(chalk.green(`${this.path}/${name}.spec.js created successfully`));
			this.open(`${this.path}/${name}.spec.js`);
		} catch (error) {
			console.log(chalk.red(`${this.path}/${name}.spec.js creation failed with the following error`, error));
		}
	}
}

MakeTest.signature = "make:test <name>";
MakeTest.description = "Generate a test file";
MakeTest.options = {
	'--unit': 'Generate a unit test'
};

module.exports = MakeTest;