import test from 'ava';
import sinon from 'sinon';
import GeocoderService from '../../../../App/Services/GeocoderService.js';
import Cache from '../../../../App/Services/CacheService.js';

test.beforeEach(t => {
	sinon.stub(GeocoderService.geocoders[0], 'geocode').callsFake(() => {
		return {
			data: 'Data'
		}
	});

	sinon.stub(GeocoderService.geocoders[0], 'reverse').callsFake(() => {
		return {
			data: 'Data'
		}
	});

	sinon.stub(GeocoderService.geocoders[1], 'geocode').callsFake(() => {
		return {
			data: 'Data'
		}
	});

	sinon.stub(GeocoderService.geocoders[1], 'reverse').callsFake(() => {
		return {
			data: 'Data'
		}
	});
});

test.afterEach.always(t => {
	sinon.restore();
});

test.serial('It geocodes', async t => {
	const response = await GeocoderService.geocode('Hayarden 10 haifa');

	t.deepEqual(response, {
		data: 'Data'
	});
});

test.serial('It returns fresh geocode response when not cached', async t => {
	sinon.stub(Cache, 'exists').callsFake(() => {
		return false;
	});

	sinon.stub(Cache, 'remember').callsFake(async (key, value, seconds) => {
		return await value.call();
	});
	const response = await GeocoderService.geocodeCached('Hayarden 10 haifa');

	t.deepEqual(response, {
		data: 'Data'
	});
});


test.serial('It returns cached geocode response when cached', async t => {
	const cacheStub = sinon.stub(Cache, 'remember').callsFake(() => {
		return {
			data: 'fake data'
		}
	});
	const response = await GeocoderService.geocodeCached('Hayarden 10 haifa');

	t.deepEqual(response, {
		data: 'fake data'
	});

	t.true(cacheStub.calledOnce);
});

test.serial('It reverse geocodes', async t => {
	const response = await GeocoderService.reverseGeocode(0,0);

	t.deepEqual(response, {
		data: 'Data'
	});
});

test.serial('It returns fresh reverse geocode response when not cached', async t => {
	sinon.stub(Cache, 'exists').callsFake(() => {
		return false;
	});

	sinon.stub(Cache, 'remember').callsFake(async (key, value, seconds) => {
		return await value.call();
	});
	const response = await GeocoderService.reverseGeocodeCached(0,0);

	t.deepEqual(response, {
		data: 'Data'
	});
});


test.serial('It returns cached reverse geocode response when cached', async t => {
	const cacheStub = sinon.stub(Cache, 'remember').callsFake(() => {
		return {
			data: 'fake data'
		}
	});
	const response = await GeocoderService.reverseGeocodeCached(0,0);


	t.deepEqual(response, {
		data: 'fake data'
	});

	t.true(cacheStub.calledOnce);
});
