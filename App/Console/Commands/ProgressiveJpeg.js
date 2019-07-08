const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

class ProgressiveJpeg {
	constructor() {
	}

	async handle() {
		console.log(chalk.yellow(`Converting images to progressive jpeg`));

		try {
			for (const folder of [
				'bios',
				'images',
				'thumbnails'
			]) {
				const folderPath = path.resolve(process.cwd() + `/public/${folder}`);
				for (const file of fs.readdirSync(folderPath)) {
					await this.convertFile(file, folderPath);
				}
			}

			console.log(chalk.green(`files converted`));
		} catch (error) {
			console.log(error);
		}
	}

	async convertFile(file, folderPath) {
		if (/.*\.png/.test(file)) {
			console.log(file + ' is png');
			return;
		}
		const filePath = `${folderPath}/${file}`;

		await sharp(filePath).jpeg({progressive: true}).toFile(filePath + '-progressive');
		sharp.cache(false);
		fs.renameSync(filePath + '-progressive', filePath);
	}
}

ProgressiveJpeg.signature = "jpeg:convert";
ProgressiveJpeg.description = "Converts all jpegs to progressive jpegs";

module.exports = ProgressiveJpeg;
