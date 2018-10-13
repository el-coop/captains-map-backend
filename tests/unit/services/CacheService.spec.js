import test from 'ava';
import sinon from 'sinon';
import Cache from '../../../App/services/CacheService';

test.afterEach.always(() => {
	sinon.restore();
});

test.serial('exists return true when key exists in redis', async t => {
	sinon.stub(Cache.store(), 'exists').callsFake(() => {
		return true;
	});

	t.true(await Cache.exists('key'));
});

test.serial('exists return false when key exists in redis', async t => {
	sinon.stub(Cache.store(), 'exists').callsFake(() => {
		return false;
	});

	t.false(await Cache.exists('key'));
});

test.serial('get return value when key exists in redis', async t => {
	sinon.stub(Cache.store(), 'exists').callsFake(() => {
		return true;
	});
	sinon.stub(Cache.store(), 'get').callsFake(() => {
		return 1;
	});

	t.is(await Cache.get('key'), 1);
});


test.serial('get return default value when key doesnt exists in redis', async t => {
	sinon.stub(Cache.store(), 'exists').callsFake(() => {
		return false;
	});

	t.is(await Cache.get('key', 2), 2);
});


test.serial('get return null when key doesnt exists in redis and no default value', async t => {
	sinon.stub(Cache.store(), 'exists').callsFake(() => {
		return false;
	});

	t.is(await Cache.get('key'), null);
});


test.serial('Remember return value when key exists in redis', async t => {
	sinon.stub(Cache.store(), 'exists').callsFake(() => {
		return true;
	});
	sinon.stub(Cache.store(), 'get').callsFake(() => {
		return 1;
	});

	t.is(await Cache.remember('key', 2, 30), 1);
});

test.serial('Remember default return value when key doesnt exists in redis and remembers', async t => {
	sinon.stub(Cache.store(), 'exists').callsFake(() => {
		return false;
	});
	const setexStub = sinon.stub(Cache.store(), 'setex');

	t.is(await Cache.remember('key', 1, 30), 1);
	t.true(setexStub.calledOnce);
	t.true(setexStub.calledWith('key', 30, JSON.stringify(1)));
});


test.serial('Remember forever return value when key exists in redis', async t => {
	sinon.stub(Cache.store(), 'exists').callsFake(() => {
		return true;
	});
	sinon.stub(Cache.store(), 'get').callsFake(() => {
		return 1;
	});

	t.is(await Cache.rememberForever('key', 2, 30), 1);
});

test.serial('Remember forever default return value when key doesnt exists in redis and remembers', async t => {
	sinon.stub(Cache.store(), 'exists').callsFake(() => {
		return false;
	});
	const setexStub = sinon.stub(Cache.store(), 'set');

	t.is(await Cache.rememberForever('key', 1, 30), 1);
	t.true(setexStub.calledOnce);
	t.true(setexStub.calledWith('key', JSON.stringify(1)));
});

test.serial('forget calls delete on redis', async t => {
	const deleteStub = sinon.stub(Cache.store(), 'del');

	await Cache.forget('key');

	t.true(deleteStub.calledOnce);
	t.true(deleteStub.calledWith('key'));
});