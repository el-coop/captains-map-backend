const Redis = require('ioredis');
const redis = new Redis({
	port: process.env.CACHE_PORT,          // Redis port
	host: process.env.CACHE_HOST,   // Redis host
	password: process.env.CACHE_PASSWORD,
	keyPrefix: `${process.env.CACHE_PREFIX}_`,
	db: process.env.CACHE_DB || 0,
	enableOfflineQueue: true
});
redis.on('error', function (error) {
	if (error.code !== 'ETIMEDOUT') {
		console.log(error);
	}
});

const TaggedCacheService = require('./TaggedCacheService');

class Cache {

	async exists(key) {
		if (this.status !== 'ready') {
			return false;
		}
		return await redis.exists(key);
	}

	async get(key, defaultValue = null) {
		try {
			if (this.status === 'ready' && await this.exists(key)) {
				return await redis.get(key);
			}
		} catch (error) {
			console.log('catch', error);
		}
		if (typeof defaultValue === 'function') {
			defaultValue = await defaultValue.call();
		}
		return defaultValue;
	}

	async remember(key, value, seconds) {
		try {
			if (this.status === 'ready' && await this.exists(key)) {
				return JSON.parse(await redis.get(key));
			}
		} catch (e) {
		}

		if (typeof value === 'function') {
			value = await value.call();
		}
		try {
			if (seconds) {
				redis.setex(key, seconds, JSON.stringify(value));
			} else {
				redis.set(key, JSON.stringify(value));
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
		redis.del(key);
		return true;
	}


	async flush() {
		redis.flushall();
		return true;
	}

	get status() {
		return redis.status;
	}

	get store() {
		return redis;
	}

	tag(tags) {
		return new TaggedCacheService(this, tags);
	}
}

module.exports = new Cache();
