const Redis = require('ioredis');
const redis = new Redis({
	port: process.env.CACHE_PORT,          // Redis port
	host: process.env.CACHE_HOST,   // Redis host
	password: process.env.CACHE_PASSWORD,
	keyPrefix: `${process.env.CACHE_PREFIX}_`,
	db: process.env.CACHE_DB || 0
});
const TaggedCacheService = require('./TaggedCacheService');

class Cache {

	async exists(key) {
		return await redis.exists(key);
	}

	async get(key, defaultValue = null) {
		try {
			if (await this.exists(key)) {
				return await redis.get(key);
			}
		} catch (e) {
		}
		if (typeof defaultValue === 'function') {
			defaultValue = await defaultValue.call();
		}
		return defaultValue;
	}

	async remember(key, value, seconds) {
		try {
			if (await this.exists(key)) {
				return JSON.parse(await redis.get(key));
			}
		} catch (e) {
		}

		if (typeof value === 'function') {
			value = await value.call();
		}
		try {
			if (seconds) {
				await redis.setex(key, seconds, JSON.stringify(value));
			} else {
				await redis.set(key, JSON.stringify(value));
			}
		} catch (error) {
			console.log(error);
		}
		return value;
	}

	async rememberForever(key, value) {
		return await this.remember(key, value, null);
	}

	async forget(key) {
		await redis.del(key);
		return true;
	}

	get store() {
		return redis;
	}

	tag(tags) {
		return new TaggedCacheService(this, tags);
	}
}

module.exports = new Cache();
