import test from 'ava';
import sinon from 'sinon';
import Cache from '../../../../App/Services/CacheService';
import TaggedCacheService from '../../../../App/Services/TaggedCacheService';

test.afterEach.always(() => {
	sinon.restore();
});

test.serial('exists return true when key exists in redis', async t => {
	sinon.stub(Cache, 'status').get(() => {
		return 'ready'
	});
	sinon.stub(Cache.store, 'exists').returns(true);

	t.true(await Cache.exists('key'));
});

test.serial('exists return false when key exists in redis', async t => {
	sinon.stub(Cache, 'status').get(() => {
		return 'ready'
	});
	sinon.stub(Cache.store, 'exists').callsFake(() => {
		return false;
	});

	t.false(await Cache.exists('key'));
});

test.serial('get return value when key exists in redis', async t => {
	sinon.stub(Cache, 'status').get(() => {
		return 'ready'
	});
	sinon.stub(Cache.store, 'exists').callsFake(() => {
		return true;
	});
	sinon.stub(Cache.store, 'get').callsFake(() => {
		return 1;
	});

	t.is(await Cache.get('key'), 1);
});


test.serial('get return default value when key doesnt exists in redis', async t => {
	sinon.stub(Cache, 'status').get(() => {
		return 'ready'
	});
	sinon.stub(Cache.store, 'exists').callsFake(() => {
		return false;
	});

	t.is(await Cache.get('key', 2), 2);
});


test.serial('get return null when key doesnt exists in redis and no default value', async t => {
	sinon.stub(Cache, 'status').get(() => {
		return 'ready'
	});
	sinon.stub(Cache.store, 'exists').callsFake(() => {
		return false;
	});

	t.is(await Cache.get('key'), null);
});


test.serial('Remember return value when key exists in redis', async t => {
	sinon.stub(Cache, 'status').get(() => {
		return 'ready'
	});
	sinon.stub(Cache.store, 'exists').callsFake(() => {
		return true;
	});
	sinon.stub(Cache.store, 'get').callsFake(() => {
		return 1;
	});

	t.is(await Cache.remember('key', 2, 30), 1);
});

test.serial('Remember default return value when key doesnt exists in redis and remembers', async t => {
	sinon.stub(Cache, 'status').get(() => {
		return 'ready'
	});
	sinon.stub(Cache.store, 'exists').callsFake(() => {
		return false;
	});
	const setexStub = sinon.stub(Cache.store, 'setex');

	t.is(await Cache.remember('key', 1, 30), 1);
	t.true(setexStub.calledOnce);
	t.true(setexStub.calledWith('key', 30, JSON.stringify(1)));
});


test.serial('Remember forever return value when key exists in redis', async t => {
	sinon.stub(Cache, 'status').get(() => {
		return 'ready'
	});
	sinon.stub(Cache.store, 'exists').callsFake(() => {
		return true;
	});
	sinon.stub(Cache.store, 'get').callsFake(() => {
		return 1;
	});

	t.is(await Cache.rememberForever('key', 2, 30), 1);
});

test.serial('Remember forever default return value when key doesnt exists in redis and remembers', async t => {
	sinon.stub(Cache, 'status').get(() => {
		return 'ready'
	});
	sinon.stub(Cache.store, 'exists').callsFake(() => {
		return false;
	});
	const setStub = sinon.stub(Cache.store, 'set');

	t.is(await Cache.rememberForever('key', 1, 30), 1);
	t.true(setStub.calledOnce);
	t.true(setStub.calledWith('key', JSON.stringify(1)));
});

test.serial('forget calls delete on redis', async t => {
	sinon.stub(Cache, 'status').get(() => {
		return 'ready'
	});
	const deleteStub = sinon.stub(Cache.store, 'del');

	await Cache.forget('key');

	t.true(deleteStub.calledOnce);
	t.true(deleteStub.calledWith('key'));
});

test.serial('Tags returns new tagged cacge', t => {
	sinon.stub(Cache, 'status').get(() => {
		return 'ready'
	});
	const taggedCache = Cache.tag(['tag1', 'tag2']);

	t.true(taggedCache instanceof TaggedCacheService);
	t.deepEqual(taggedCache.tags, [
		'tag1',
		'tag2'
	]);
});

test.serial('exists return false when redis not connected', async t => {
	sinon.stub(Cache, 'status').get(() => {
		return 'connecting'
	});

	t.false(await Cache.exists('key'));
});


test.serial('get returns default value when not connected', async t => {
	sinon.stub(Cache, 'status').get(() => {
		return 'connecting'
	});

	t.is(await Cache.get('key', 2), 2);
});


test.serial('Remember returns default value when key doesnt exists in redis and remembers', async t => {
	sinon.stub(Cache, 'status').get(() => {
		return 'connecting'
	});

	const setexStub = sinon.stub(Cache.store, 'setex');

	t.is(await Cache.remember('key', 1, 30), 1);
	t.true(setexStub.calledOnce);
	t.true(setexStub.calledWith('key', 30, JSON.stringify(1)));
});
