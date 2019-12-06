const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const Bio = require('../../Models/Bio');
const Media = require('../../Models/Media');


class DeleteUnusedImages {
	constructor() {
	}

	async handle() {
		console.log(chalk.yellow(`Starting cleaning process`));

		const ignore = ['globe-icon.png'];

		try {
			const folderModelDictionary = {
				'bios': {
					model: Bio,
					prefix: '/bios/'
				},
				'images': {
					model: Media,
					prefix: '/images/'
				},
				'thumbnails': {
					model: Media,
					prefix: '/images/'
				}
			};
			let deleted = 0;
			for (const folder in folderModelDictionary) {
				const folderPath = path.resolve(process.cwd() + `/public/${folder}`);
				const model = folderModelDictionary[folder].model;
				const prefix = folderModelDictionary[folder].prefix;
				for (const file of fs.readdirSync(folderPath)) {
					if (ignore.indexOf(file) < 0) {
						const imageModel = await new model('path', `${prefix}${file}`).fetch({
							require: false
						});
						if (!imageModel) {
							const filePath = `${folderPath}/${file}`;
							console.log(chalk.yellow(`Deleting ${filePath}`));
							fs.unlinkSync(filePath);
							console.log(chalk.green(`Deleted ${filePath}`));
							deleted++;
						}
					}
				}
			}

			console.log(chalk.green(`${deleted} unused images deleted successfully`));
		} catch (error) {
			console.log(chalk.red(`There was an error while deleting images`), error);
		}
	}
}

DeleteUnusedImages.signature = "images:clearUnused";
DeleteUnusedImages.description = "Deletes all unused images";

module.exports = DeleteUnusedImages;
