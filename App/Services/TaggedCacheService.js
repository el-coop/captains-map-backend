let cache;
const deleteValues = Symbol('deleteValues');

async function asyncForEach(array, callback) {
	for (let index = 0; index < array.length; index++) {
		await callback(array[index], index, array);
	}
}

class TaggedCacheService {
	constructor(cacheInstance, tags) {
		cache = cacheInstance;
		this.tags = tags;
	}

	async remember(key, value, seconds) {
		const result = await cache.remember(key, value, seconds);
		await asyncForEach(this.tags, async (tag) => {
			try {
				let ttl = 0;
				if (seconds) {
					ttl = Date.now() + seconds * 1000;
				}
				await cache.store.zadd(`tag:${tag}`, ttl, key);
			} catch (error) {
			}
		});
		return result;
	}

	async rememberForever(key, value) {
		return await this.remember(key, value, null);
	}

	async flush() {
		await this[deleteValues]();
		await cache.forget(this.tags);
	}

	async [deleteValues]() {
		await asyncForEach(this.tags, async (tag) => {
			let keys = [];
			try {
				keys = await cache.store.zrange(`tag:${tag}`, 0, -1);
			} catch (e) {
			}
			while (keys.length > 0) {
				await cache.forget(keys.splice(0, 1000));
			}
		});
	}

	static async expireOld(cache) {
		const tags = await cache.store.keys(`${process.env.CACHE_PREFIX}_tag:*`);
		console.log('tags:', tags);
		await asyncForEach(tags, async (tag) => {
			console.log(`Expiring ${tag}`);
			const tagName = tag.substring(process.env.CACHE_PREFIX.length + 1);
			await cache.store.zremrangebyscore(tagName, 1, Date.now());
			if (!await cache.store.zcard(tagName)) {
				await cache.forget(tagName);
			}
		});
	}


}

module.exports = TaggedCacheService;
