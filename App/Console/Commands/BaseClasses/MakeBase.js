const fs = require('fs');
const chalk = require('chalk');
const path = require('path');
const exec = require('child_process').execSync;

class MakeBase {
	constructor() {
		this.path = '';
		this.stub = '';
	}

	handle(name) {
		console.log(chalk.yellow(`generating ${this.path}/${name}.js`));

		try {
			this.ensureDirExistence(name);
			this.writeToFile(name);
			console.log(chalk.green(`${this.path}/${name}.js created successfully`));
			this.open(`${this.path}/${name}.js`);
		} catch (error) {
			console.log(chalk.red(`${this.path}/${name}.js creation failed with the following error`, error));
		}
	}

	open(file) {
		file = file.replace(/\//g, '\\');
		try {
			exec(`start ${file}`);
		} catch (error) {
			console.log(chalk.red(error));
		}
	}

	writeToFile(name) {
		let stub = fs.readFileSync(path.resolve(__dirname, '../Stubs', this.stub)).toString();
		fs.writeFileSync(`${this.path}/${name}.js`, stub.split('{{name}}').join(name.substring(name.lastIndexOf('/') + 1)));
	}

	ensureDirExistence(name) {
		const filename = `${this.path}/${name}.js`;
		const path = filename.substring(0, filename.lastIndexOf('/'));
		if (!fs.existsSync(path)) {
			fs.mkdirSync(path, {
				recursive: true,
				mode: 0o755
			});
		}
	}
}

module.exports = MakeBase;
