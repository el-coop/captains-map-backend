import chalk from 'chalk';

import cache from '../../Services/CacheService.js';
import TaggedCache from '../../Services/TaggedCacheService.js';

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

export default CacheExpireTags;
