import test from 'ava';
import sinon from 'sinon';
import TaggedCacheService from '../../../../App/Services/TaggedCacheService';

test.afterEach.always('Restore sinon', t => {
	sinon.restore();
});

test('remember adds tag and returns cache remember result', async t => {
	const cache = {
		store: {
			zadd: sinon.stub()
		},
		remember: sinon.stub().returns('bla')
	};

	const taggedCache = new TaggedCacheService(cache, ['tag1', 'tag2']);

	const result = await taggedCache.remember('key', 'test', 100);

	t.is(result, 'bla');
	t.true(cache.store.zadd.calledTwice);
	t.true(cache.store.zadd.firstCall.calledWith('tag:tag1', sinon.match.number, 'key'));
	t.true(cache.store.zadd.secondCall.calledWith('tag:tag2', sinon.match.number, 'key'));

	t.true(cache.remember.calledOnce);
	t.true(cache.remember.calledWithExactly('key', 'test', 100));
});

test('remember forever adds tag and returns cache remember result', async t => {
	const cache = {
		store: {
			zadd: sinon.stub()
		},
		remember: sinon.stub().returns('bla')
	};

	const taggedCache = new TaggedCacheService(cache, ['tag1', 'tag2']);

	const result = await taggedCache.rememberForever('key', 'test', 100);

	t.is(result, 'bla');
	t.true(cache.store.zadd.calledTwice);
	t.true(cache.store.zadd.firstCall.calledWithExactly('tag:tag1', 0, 'key'));
	t.true(cache.store.zadd.secondCall.calledWithExactly('tag:tag2', 0, 'key'));

	t.true(cache.remember.calledOnce);
	t.true(cache.remember.calledWithExactly('key', 'test', null));
});

test('it flushes tag data', async t => {
	const cache = {
		store: {
			zrange: sinon.stub().onFirstCall().returns(['key', 'key1']).onSecondCall().returns(['key2', 'key3'])
		},
		forget: sinon.stub()
	};

	const taggedCache = new TaggedCacheService(cache, ['tag1', 'tag2']);

	await taggedCache.flush();

	t.true(cache.store.zrange.calledTwice);
	t.true(cache.store.zrange.firstCall.calledWithExactly('tag:tag1', 0, -1));
	t.true(cache.store.zrange.secondCall.calledWithExactly('tag:tag2', 0, -1));

	t.true(cache.forget.calledThrice);
	t.true(cache.forget.firstCall.calledWithExactly(['key', 'key1']));
	t.true(cache.forget.secondCall.calledWithExactly(['key2', 'key3']));
	t.true(cache.forget.thirdCall.calledWithExactly(['tag1', 'tag2']));
});

test('it expires old tags', async t => {
	const cache = {
		store: {
			zcard: sinon.stub().onFirstCall().returns(2).onSecondCall().returns(0),
			zremrangebyscore: sinon.stub(),
			keys: sinon.stub().returns([
				`${process.env.CACHE_PREFIX}_tag:1`,
				`${process.env.CACHE_PREFIX}_tag:2`,
			]),
		},
		forget: sinon.stub()
	};

	await TaggedCacheService.expireOld(cache);

	t.true(cache.store.zremrangebyscore.calledTwice);
	t.true(cache.store.zremrangebyscore.firstCall.calledWith('tag:1', 1));
	t.true(cache.store.zremrangebyscore.secondCall.calledWith('tag:2', 1));
	t.true(cache.forget.calledOnce);
	t.true(cache.forget.calledWith('tag:2'));
});
