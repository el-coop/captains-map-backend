const chalk = require('chalk');

const cache = require('../../Services/CacheService');
const TaggedCache = require('../../Services/TaggedCacheService');

class CacheExpireTags {
	constructor() {
	}

	async handle() {
		console.log(chalk.yellow(`Expiring old tag entries`));

		try {
			await TaggedCache.expireOld(cache);
			console.log(chalk.green(`tags expired successfully`));
		} catch (error) {
			console.log(chalk.red(`An error was thrown while expiring tags`, error));
		}
	}
}

CacheExpireTags.signature = "cache:expireTags";
CacheExpireTags.description = "Expires old tags from redis database";

module.exports = CacheExpireTags;
