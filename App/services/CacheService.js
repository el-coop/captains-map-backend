const Redis = require('ioredis');
const redis = new Redis({
	port: process.env.CACHE_PORT,          // Redis port
	host: process.env.CACHE_HOST,   // Redis host
	password: process.env.CACHE_PASSWORD,
	keyPrefix: process.env.CACHE_PREFIX
});

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
			await redis.setex(key, seconds, JSON.stringify(value));
		} catch (error) {
			console.log(error);
		}
		return value;
	}

	async rememberForever(key, value) {
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
			await redis.set(key, JSON.stringify(value));
		} catch (error) {
			console.log(error);
		}
		return value;
	}

	async forget(key) {
		await redis.del(key);
		return true;
	}

	store() {
		return redis;
	}
}

module.exports = new Cache();