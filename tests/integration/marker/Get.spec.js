import test from 'ava';
import app from '../../../app';
import knex from '../../../database/knex';
import MarkerFactory from '../../../database/factories/MarkerFactory';
import StoryFactory from '../../../database/factories/StoryFactory';
import cache from '../../../App/Services/CacheService';
import request from 'supertest';
import sinon from 'sinon';

test.beforeEach(async () => {
	await knex.migrate.latest();
	await knex.seed.run();
});

test.afterEach.always(async () => {
	await knex.migrate.rollback();
	sinon.restore();
});

test.serial('It caches then returns all existing non story markers with 1 pagination data sorted desc by id ', async t => {
	sinon.stub(cache, 'exists').returns(false);
	const Story = await StoryFactory.create({
		user_id: 1
	});
	await MarkerFactory.create({
		user_id: 1,
		story_id: Story.get('id')
	});

	const cacheSetStub = sinon.stub(cache.store, 'set');
	const taggedCacheStub = sinon.stub(cache.store, 'zadd');
	const marker0 = await MarkerFactory.create({
		user_id: 1,
	});
	const marker1 = await MarkerFactory.create({
		user_id: 1,
	});
	const marker2 = await MarkerFactory.create({
		user_id: 1,
	});

	const response = await request(app).get('/api/marker');

	t.is(response.body.markers.length, 3);
	t.is(response.body.markers[2].id, marker0.id);
	t.is(response.body.markers[1].id, marker1.id);
	t.is(response.body.markers[0].id, marker2.id);
	t.false(response.body.pagination.hasNext);
	t.true(cacheSetStub.calledOnce);
	t.true(cacheSetStub.calledWith('markers'));
	t.true(taggedCacheStub.calledOnce);
	t.true(taggedCacheStub.calledWith('tag:markers', 0, 'markers'));
});

test.serial('It returns all existing markers from cache with 1 pagination data sorted desc by id ', async t => {
	sinon.stub(cache, 'status').get(() => {
		return 'ready'
	});
	sinon.stub(cache, 'exists').returns(true);
	const cacheSetStub = sinon.stub(cache.store, 'set');
	const taggedCacheStub = sinon.stub(cache.store, 'zadd');
	const marker0 = await MarkerFactory.create({
		user_id: 1,
	});
	const marker1 = await MarkerFactory.create({
		user_id: 1,
	});
	const marker2 = await MarkerFactory.create({
		user_id: 1,
	});
	sinon.stub(cache.store, 'get').returns(JSON.stringify({
		markers: [
			marker2,
			marker1,
			marker0,
		],
		pagination: {
			hasNext: false
		}
	}));

	const response = await request(app).get('/api/marker');
	t.is(response.body.markers.length, 3);
	t.is(response.body.markers[2].id, marker0.id);
	t.is(response.body.markers[1].id, marker1.id);
	t.is(response.body.markers[0].id, marker2.id);
	t.false(response.body.pagination.hasNext);
	t.false(cacheSetStub.called);
	t.true(taggedCacheStub.calledOnce);
	t.true(taggedCacheStub.calledWith('tag:markers', 0, 'markers'));
});

test.serial('It returns data in pages when there is much data', async t => {
	sinon.stub(cache, 'exists').returns(false);
	sinon.stub(cache.store, 'set');
	sinon.stub(cache.store, 'zadd');
	await MarkerFactory.create({
		user_id: 1
	}, 4);

	const Story = await StoryFactory.create({
		user_id: 1
	});
	await MarkerFactory.create({
		user_id: 1,
		story_id: Story.get('id')
	});

	const response = await request(app).get('/api/marker');
	t.is(response.body.markers.length, 3);
	t.true(response.body.pagination.hasNext);
});

test.serial('It returns data and caches after id when there id is specified', async t => {
	sinon.stub(cache, 'exists').returns(false);
	const cacheSetStub = sinon.stub(cache.store, 'set');
	const taggedCacheStub = sinon.stub(cache.store, 'zadd');

	const Story = await StoryFactory.create({
		user_id: 1
	});
	await MarkerFactory.create({
		user_id: 1,
		story_id: Story.get('id')
	});

	const markers = await MarkerFactory.create({
		user_id: 1
	}, 5);

	const response = await request(app).get(`/api/marker?startingId=${markers[2].id}`);
	t.is(response.body.markers.length, 2);
	t.is(response.body.markers[1].id, markers[0].id);
	t.is(response.body.markers[0].id, markers[1].id);
	t.false(response.body.pagination.hasNext);
	t.true(cacheSetStub.calledOnce);
	t.true(cacheSetStub.calledWith(`markers_starting:${markers[2].id}`));
	t.true(taggedCacheStub.calledOnce);
	t.true(taggedCacheStub.calledWith('tag:markers', 0, `markers_starting:${markers[2].id}`));
});

test.serial('It returns data from cache after id when there id is specified', async t => {
	sinon.stub(cache, 'status').get(() => {
		return 'ready'
	});
	sinon.stub(cache, 'exists').returns(true);
	const cacheSetStub = sinon.stub(cache.store, 'set');
	const taggedCacheStub = sinon.stub(cache.store, 'zadd');
	const markers = await MarkerFactory.create({
		user_id: 1
	}, 5);

	sinon.stub(cache.store, 'get').returns(JSON.stringify({
		markers: [
			markers[1],
			markers[0],
		],
		pagination: {
			hasNext: false
		}
	}));

	const response = await request(app).get(`/api/marker?startingId=${markers[2].id}`);
	t.is(response.body.markers.length, 2);
	t.is(response.body.markers[1].id, markers[0].id);
	t.is(response.body.markers[0].id, markers[1].id);
	t.false(response.body.pagination.hasNext);
	t.false(cacheSetStub.called);
	t.true(taggedCacheStub.calledOnce);
	t.true(taggedCacheStub.calledWith('tag:markers', 0, 'markers_starting:3'));
});

test.serial('It returns and caches only markers of specific user with hasNext false when one page', async t => {
	sinon.stub(cache, 'exists').returns(false);
	const taggedCacheStub = sinon.stub(cache.store, 'zadd');
	const cacheSetStub = sinon.stub(cache.store, 'set');

	const Story = await StoryFactory.create({
		user_id: 1
	});
	await MarkerFactory.create({
		user_id: 1,
		story_id: Story.get('id')
	});

	const marker0 = await MarkerFactory.create({
		user_id: 1,
	});
	const marker1 = await MarkerFactory.create({
		user_id: 1,
	});
	await MarkerFactory.create({
		user_id: 2,
	}, 2);

	const response = await request(app).get('/api/marker/nur');
	t.is(response.body.markers.length, 2);
	t.is(response.body.markers[0].id, marker1.id);
	t.is(response.body.markers[1].id, marker0.id);
	t.false(response.body.pagination.hasNext);
	t.true(cacheSetStub.calledOnce);
	t.true(cacheSetStub.calledWith('markers_user:1'));
	t.true(taggedCacheStub.calledOnce);
	t.true(taggedCacheStub.calledWith('tag:markers_user:1', 0, 'markers_user:1'));
});


test.serial('It returns from cache only markers of specific user with hasNext false when one page', async t => {
	sinon.stub(cache, 'status').get(() => {
		return 'ready'
	});
	sinon.stub(cache, 'exists').returns(true);
	const taggedCacheStub = sinon.stub(cache.store, 'zadd');
	const cacheSetStub = sinon.stub(cache.store, 'set');
	const marker0 = await MarkerFactory.create({
		user_id: 1,
	});
	const marker1 = await MarkerFactory.create({
		user_id: 1,
	});
	await MarkerFactory.create({
		user_id: 2,
	}, 2);

	sinon.stub(cache.store, 'get').returns(JSON.stringify({
		markers: [
			marker1, marker0
		],
		pagination: {
			hasNext: false
		}
	}));

	const response = await request(app).get('/api/marker/nur');
	t.is(response.body.markers.length, 2);
	t.is(response.body.markers[0].id, marker1.id);
	t.is(response.body.markers[1].id, marker0.id);
	t.false(response.body.pagination.hasNext);
	t.true(taggedCacheStub.calledOnce);
	t.true(taggedCacheStub.calledWith('tag:markers_user:1', 0, 'markers_user:1'));
	t.false(cacheSetStub.called);
});

test.serial('It returns and caches only markers of specific user after specific id when specified', async t => {
	sinon.stub(cache, 'exists').returns(false);
	const taggedCacheStub = sinon.stub(cache.store, 'zadd');
	const cacheSetStub = sinon.stub(cache.store, 'set');

	const Story = await StoryFactory.create({
		user_id: 1
	});
	await MarkerFactory.create({
		user_id: 1,
		story_id: Story.get('id')
	});

	const userFirstMarkers = await MarkerFactory.create({
		user_id: 1,
	}, 3);
	await MarkerFactory.create({
		user_id: 2,
		created_at: new Date(Date.now() - 4 * 24 * 3600 * 1000)
	});
	const userSecondMarkers = await MarkerFactory.create({
		user_id: 1,
	}, 4);

	const response = await request(app).get(`/api/marker/nur?startingId=${userSecondMarkers[2].id}`);
	t.is(response.body.markers.length, 3);
	t.not(undefined, response.body.markers.find((item) => {
		return item.id === userFirstMarkers[2].id;
	}));
	t.not(undefined, response.body.markers.find((item) => {
		return item.id === userSecondMarkers[1].id;
	}));
	t.not(undefined, response.body.markers.find((item) => {
		return item.id === userSecondMarkers[0].id;
	}));
	t.true(response.body.pagination.hasNext);
	t.true(cacheSetStub.calledOnce);
	t.true(cacheSetStub.calledWith(`markers_user:1_starting:${userSecondMarkers[2].id}`));
	t.true(taggedCacheStub.calledOnce);
	t.true(taggedCacheStub.calledWith('tag:markers_user:1', 0, `markers_user:1_starting:${userSecondMarkers[2].id}`));
});

test.serial('It returns from cache only markers of specific user after specific id when specified', async t => {
	sinon.stub(cache, 'status').get(() => {
		return 'ready'
	});
	sinon.stub(cache, 'exists').returns(true);
	const taggedCacheStub = sinon.stub(cache.store, 'zadd');
	const cacheSetStub = sinon.stub(cache.store, 'set');
	const userFirstMarkers = await MarkerFactory.create({
		user_id: 1,
	}, 3);
	await MarkerFactory.create({
		user_id: 2,
		created_at: new Date(Date.now() - 4 * 24 * 3600 * 1000)
	});
	const userSecondMarkers = await MarkerFactory.create({
		user_id: 1,
	}, 4);

	sinon.stub(cache.store, 'get').returns(JSON.stringify({
		markers: [
			userFirstMarkers[2], userSecondMarkers[1], userSecondMarkers[0]
		],
		pagination: {
			hasNext: true
		}
	}));

	const response = await request(app).get(`/api/marker/nur?startingId=${userSecondMarkers[2].id}`);
	t.is(response.body.markers.length, 3);
	t.not(undefined, response.body.markers.find((item) => {
		return item.id === userFirstMarkers[2].id;
	}));
	t.not(undefined, response.body.markers.find((item) => {
		return item.id === userSecondMarkers[1].id;
	}));
	t.not(undefined, response.body.markers.find((item) => {
		return item.id === userSecondMarkers[0].id;
	}));
	t.true(response.body.pagination.hasNext);
	t.false(cacheSetStub.called);
	t.true(taggedCacheStub.calledOnce);
	t.true(taggedCacheStub.calledWith('tag:markers_user:1', 0, 'markers_user:1_starting:7'));
});

test.serial('It returns only markers of specific user with hasNext true when more than one page', async t => {
	sinon.stub(cache, 'exists').returns(false);
	sinon.stub(cache.store, 'zadd');
	sinon.stub(cache.store, 'set');

	const Story = await StoryFactory.create({
		user_id: 1
	});
	await MarkerFactory.create({
		user_id: 1,
		story_id: Story.get('id')
	});

	await MarkerFactory.create({
		user_id: 1,
	}, 4);
	await MarkerFactory.create({
		user_id: 2,
		created_at: new Date(Date.now() - 4 * 24 * 3600 * 1000)
	});

	const response = await request(app).get('/api/marker/nur');
	t.is(response.body.markers.length, 3);
	t.true(response.body.pagination.hasNext);
});

test.serial('It returns and caches specific marker page with has next when needed', async t => {
	sinon.stub(cache, 'exists').returns(false);
	const taggedCacheStub = sinon.stub(cache.store, 'zadd');
	const cacheSetStub = sinon.stub(cache.store, 'set');

	const Story = await StoryFactory.create({
		user_id: 1
	});
	await MarkerFactory.create({
		user_id: 1,
		story_id: Story.get('id')
	});

	const markers = await MarkerFactory.create({
		user_id: 1,
	}, 4);

	const response = await request(app).get(`/api/marker/nur/${markers[3].id}`);
	const responseMarkers = response.body.markers;
	t.is(responseMarkers.length, 3);
	t.is(undefined, responseMarkers.find((item) => {
		return item.id === markers[0].id;
	}));
	t.not(undefined, responseMarkers.find((item) => {
		return item.id === markers[1].id;
	}));
	t.not(undefined, responseMarkers.find((item) => {
		return item.id === markers[2].id;
	}));
	t.not(undefined, responseMarkers.find((item) => {
		return item.id === markers[3].id;
	}));

	t.true(response.body.pagination.hasNext);
	t.is(response.body.pagination.page, 0);
	t.true(cacheSetStub.calledOnce);
	t.true(cacheSetStub.calledWith(`markers_user:1_marker:${markers[3].id}`));
	t.true(taggedCacheStub.calledOnce);
	t.true(taggedCacheStub.calledWith('tag:markers_user:1', 0, `markers_user:1_marker:${markers[3].id}`));
});

test.serial('It returns from cache specific marker page with has next when needed', async t => {
	sinon.stub(cache, 'status').get(() => {
		return 'ready'
	});
	sinon.stub(cache, 'exists').returns(true);
	const taggedCacheStub = sinon.stub(cache.store, 'zadd');
	const cacheSetStub = sinon.stub(cache.store, 'set');

	const markers = await MarkerFactory.create({
		user_id: 1,
	}, 4);

	sinon.stub(cache.store, 'get').returns(JSON.stringify({
		markers: [
			markers[1], markers[2], markers[3]
		],
		pagination: {
			hasNext: true,
			page: 0
		}
	}));

	const response = await request(app).get(`/api/marker/nur/${markers[3].id}`);
	const responseMarkers = response.body.markers;
	t.is(responseMarkers.length, 3);
	t.is(undefined, responseMarkers.find((item) => {
		return item.id === markers[0].id;
	}));
	t.not(undefined, responseMarkers.find((item) => {
		return item.id === markers[1].id;
	}));
	t.not(undefined, responseMarkers.find((item) => {
		return item.id === markers[2].id;
	}));
	t.not(undefined, responseMarkers.find((item) => {
		return item.id === markers[3].id;
	}));

	t.true(response.body.pagination.hasNext);
	t.is(response.body.pagination.page, 0);
	t.false(cacheSetStub.called);
	t.true(taggedCacheStub.calledOnce);
	t.true(taggedCacheStub.calledWith('tag:markers_user:1', 0, 'markers_user:1_marker:4'));
});

test.serial('It returns specific marker page with no has next when no next', async t => {
	sinon.stub(cache, 'exists').returns(false);
	sinon.stub(cache.store, 'zadd');
	sinon.stub(cache.store, 'set');

	const Story = await StoryFactory.create({
		user_id: 1
	});
	await MarkerFactory.create({
		user_id: 1,
		story_id: Story.get('id')
	});

	const markers = await MarkerFactory.create({
		user_id: 1,
	}, 6);

	const response = await request(app).get(`/api/marker/nur/${markers[2].id}`);
	const responseMarkers = response.body.markers;
	t.is(responseMarkers.length, 3);
	t.not(undefined, responseMarkers.find((item) => {
		return item.id === markers[0].id;
	}));
	t.not(undefined, responseMarkers.find((item) => {
		return item.id === markers[1].id;
	}));
	t.not(undefined, responseMarkers.find((item) => {
		return item.id === markers[2].id;
	}));

	t.false(response.body.pagination.hasNext);
	t.is(response.body.pagination.page, 1);
});


test('It returns 404 for unknown user', async t => {
	const response = await request(app).get('/api/marker/bla');
	t.is(response.status, 404);
	t.is(response.body.message, 'Not Found');
});


test.serial('It returns 404 for unknown marker', async t => {
	sinon.stub(cache, 'exists').returns(false);
	const taggedCacheStub = sinon.stub(cache.store, 'zadd');
	const cacheSetStub = sinon.stub(cache.store, 'set');

	const response = await request(app).get('/api/marker/nur/1');

	t.is(response.status, 404);
	t.is(response.body.message, 'Not Found');
	t.false(taggedCacheStub.called);
	t.false(cacheSetStub.called);
});

test.serial('It returns and caches previous page', async t => {
	sinon.stub(cache, 'exists').returns(false);
	const taggedCacheStub = sinon.stub(cache.store, 'zadd');
	const cacheSetStub = sinon.stub(cache.store, 'set');

	const Story = await StoryFactory.create({
		user_id: 1
	});
	await MarkerFactory.create({
		user_id: 1,
		story_id: Story.get('id')
	});

	const markers = await MarkerFactory.create({
		user_id: 1,
	}, 6);

	const response = await request(app).get(`/api/marker/nur/${markers[2].id}/previous`);
	const responseMarkers = response.body.markers;
	t.is(responseMarkers.length, 3);
	t.not(undefined, responseMarkers.find((item) => {
		return item.id === markers[3].id;
	}));
	t.not(undefined, responseMarkers.find((item) => {
		return item.id === markers[4].id;
	}));
	t.not(undefined, responseMarkers.find((item) => {
		return item.id === markers[5].id;
	}));

	t.is(response.body.pagination.hasNext, null);
	t.is(response.body.pagination.page, null);
	t.true(cacheSetStub.calledOnce);
	t.true(cacheSetStub.calledWith(`markers_prevUser:1_marker:${markers[2].id}`));
	t.true(taggedCacheStub.calledOnce);
	t.true(taggedCacheStub.calledWith('tag:markers_user:1', 0, `markers_prevUser:1_marker:${markers[2].id}`));
});

test.serial('It returns from cache previous page', async t => {
	sinon.stub(cache, 'status').get(() => {
		return 'ready'
	});
	sinon.stub(cache, 'exists').returns(true);
	const taggedCacheStub = sinon.stub(cache.store, 'zadd');
	const cacheSetStub = sinon.stub(cache.store, 'set');

	const markers = await MarkerFactory.create({
		user_id: 1,
	}, 6);

	sinon.stub(cache.store, 'get').returns(JSON.stringify({
		markers: [
			markers[3], markers[4], markers[5]
		],
		pagination: {
			hasNext: null,
			page: null
		}
	}));

	const response = await request(app).get(`/api/marker/nur/${markers[2].id}/previous`);
	const responseMarkers = response.body.markers;
	t.is(responseMarkers.length, 3);
	t.not(undefined, responseMarkers.find((item) => {
		return item.id === markers[3].id;
	}));
	t.not(undefined, responseMarkers.find((item) => {
		return item.id === markers[4].id;
	}));
	t.not(undefined, responseMarkers.find((item) => {
		return item.id === markers[5].id;
	}));

	t.is(response.body.pagination.hasNext, null);
	t.is(response.body.pagination.page, null);
	t.false(cacheSetStub.called);
	t.true(taggedCacheStub.calledOnce);
	t.true(taggedCacheStub.calledWith('tag:markers_user:1', 0, 'markers_prevUser:1_marker:3'));
});


test.serial('It returns and caches all markers within boundaries', async t => {
	sinon.stub(cache, 'exists').returns(false);
	const taggedCacheStub = sinon.stub(cache.store, 'zadd');
	const cacheSetStub = sinon.stub(cache.store, 'set');

	const Story = await StoryFactory.create({
		user_id: 1
	});
	await MarkerFactory.create({
		user_id: 1,
		story_id: Story.get('id'),
		lat: 9.23849,
		lng: -9.4922,
	});

	const marker0 = await MarkerFactory.create({
		user_id: 1,
		lat: 9.23849,
		lng: -9.4922,
	});
	const marker1 = await MarkerFactory.create({
		user_id: 1,
		lat: 4.19,
		lng: -4.24,
	});
	await MarkerFactory.create({
		user_id: 1,
		lat: 14.19,
		lng: -4.24,
	});
	const borders = JSON.stringify([{lat: 4, lng: -9.5}, {lat: 9.5, lng: -4}]);

	const response = await request(app).get(
		`/api/marker?borders=${borders}`
	);
	t.is(response.body.markers.length, 2);
	t.is(response.body.markers[1].id, marker0.id);
	t.is(response.body.markers[0].id, marker1.id);
	t.false(response.body.pagination.hasNext);

	t.true(cacheSetStub.calledOnce);
	t.true(cacheSetStub.calledWith(`markers_borders:${borders}`));
	t.true(taggedCacheStub.calledOnce);
	t.true(taggedCacheStub.calledWith('tag:markers', 0, `markers_borders:${borders}`));
});

test.serial('It returns from cache all markers within boundaries', async t => {
	sinon.stub(cache, 'status').get(() => {
		return 'ready'
	});
	sinon.stub(cache, 'exists').returns(true);
	const taggedCacheStub = sinon.stub(cache.store, 'zadd');
	const cacheSetStub = sinon.stub(cache.store, 'set');

	const marker0 = await MarkerFactory.create({
		user_id: 1,
		lat: 9.23849,
		lng: -9.4922,
	});
	const marker1 = await MarkerFactory.create({
		user_id: 1,
		lat: 4.19,
		lng: -4.24,
	});
	await MarkerFactory.create({
		user_id: 1,
		lat: 14.19,
		lng: -4.24,
	});
	const borders = JSON.stringify([{lat: 4, lng: -9.5}, {lat: 9.5, lng: -4}]);

	sinon.stub(cache.store, 'get').returns(JSON.stringify({
		markers: [
			marker1, marker0
		],
		pagination: {
			hasNext: false,
		}
	}));

	const response = await request(app).get(
		`/api/marker?borders=${borders}`
	);
	t.is(response.body.markers.length, 2);
	t.is(response.body.markers[1].id, marker0.id);
	t.is(response.body.markers[0].id, marker1.id);
	t.false(response.body.pagination.hasNext);

	t.false(cacheSetStub.called);
	t.true(taggedCacheStub.calledOnce);
	t.true(taggedCacheStub.calledWith('tag:markers', 0, `markers_borders:${borders}`));

});

test.serial('It returns and caches only markers of specific user in specific boundaries', async t => {
	sinon.stub(cache, 'exists').returns(false);
	const taggedCacheStub = sinon.stub(cache.store, 'zadd');
	const cacheSetStub = sinon.stub(cache.store, 'set');

	const Story = await StoryFactory.create({
		user_id: 1
	});
	await MarkerFactory.create({
		user_id: 1,
		story_id: Story.get('id'),
		lat: 9.23849,
		lng: -9.4922,
	});

	const borderedMarkers = await MarkerFactory.create({
		user_id: 1,
		lat: 0.5,
		lng: 0.5
	}, 4);
	await MarkerFactory.create({
		user_id: 2,
		lat: 0.5,
		lng: 0.5
	});
	await MarkerFactory.create({
		user_id: 1,
		lat: 1.5,
		lng: 1.5
	}, 2);

	const borders = JSON.stringify([{lat: 0, lng: 0}, {lat: 1, lng: 1}]);

	const response = await request(app).get(
		`/api/marker/nur?borders=${borders}`
	);
	t.is(response.body.markers.length, 3);
	t.true(response.body.pagination.hasNext);
	t.is(response.body.markers[0].id, borderedMarkers[3].id);
	t.is(response.body.markers[1].id, borderedMarkers[2].id);
	t.is(response.body.markers[2].id, borderedMarkers[1].id);

	t.true(cacheSetStub.calledOnce);
	t.true(cacheSetStub.calledWith(`markers_user:1_borders:${borders}`));
	t.true(taggedCacheStub.calledOnce);
	t.true(taggedCacheStub.calledWith('tag:markers_user:1', 0, `markers_user:1_borders:${borders}`));
});

test.serial('It returns from cache only markers of specific user in specific boundaries', async t =>{
	sinon.stub(cache, 'status').get(() => {
		return 'ready';
	});
	sinon.stub(cache, 'exists').returns(true);
	const taggedCacheStub = sinon.stub(cache.store, 'zadd');
	const cacheSetStub = sinon.stub(cache.store, 'set');

	const borderedUserMarkers = await MarkerFactory.create({
		user_id: 1,
		lat: 0.5,
		lng: 0.5
	}, 4);
	await MarkerFactory.create({
		user_id: 2,
		lat: 0.5,
		lng: 0.5
	});
	await MarkerFactory.create({
		user_id: 1,
		lat: 1.5,
		lng: 1.5
	}, 2);

	const borders = JSON.stringify([{lat: 0, lng: 0}, {lat: 1, lng: 1}]);
	sinon.stub(cache.store, 'get').returns(JSON.stringify({
		markers: [
			borderedUserMarkers[0],
			borderedUserMarkers[1],
			borderedUserMarkers[2],
		],
		pagination: {
			hasNext: true,
		}
	}));

	const response = await request(app).get(
		`/api/marker/nur?borders=${borders}`
	);
	t.is(response.body.markers.length, 3);
	t.true(response.body.pagination.hasNext);

	t.false(cacheSetStub.called);
	t.true(taggedCacheStub.calledOnce);
	t.true(taggedCacheStub.calledWith('tag:markers_user:1', 0, `markers_user:1_borders:${borders}`));
});

test.serial('It returns and caches previous page within specific boundaries', async t => {
	sinon.stub(cache, 'exists').returns(false);
	const taggedCacheStub = sinon.stub(cache.store, 'zadd');
	const cacheSetStub = sinon.stub(cache.store, 'set');

	const markers = await MarkerFactory.create({
		user_id: 1,
		lat: 0.5,
		lng: 0.6
	}, 6);

	const Story = await StoryFactory.create({
		user_id: 1
	});
	await MarkerFactory.create({
		user_id: 1,
		story_id: Story.get('id'),
		lat: 9.23849,
		lng: -9.4922,
	});

	await MarkerFactory.create({
		user_id: 1,
		lat: 2,
		lng: -2
	}, 3);

	const borders = JSON.stringify([{lat: 0, lng: 0}, {lat: 1, lng: 1}]);

	const response = await request(app).get(
		`/api/marker/nur/${markers[2].id}/previous?borders=${borders}`
	);
	const responseMarkers = response.body.markers;
	t.is(responseMarkers.length, 3);
	t.not(undefined, responseMarkers.find((item) => {
		return item.id === markers[3].id;
	}));
	t.not(undefined, responseMarkers.find((item) => {
		return item.id === markers[4].id;
	}));
	t.not(undefined, responseMarkers.find((item) => {
		return item.id === markers[5].id;
	}));

	t.is(response.body.pagination.hasNext, null);
	t.is(response.body.pagination.page, null);

	t.true(cacheSetStub.calledOnce);
	t.true(cacheSetStub.calledWith(`markers_prevUser:1_borders:${borders}_marker:${markers[2].id}`));
	t.true(taggedCacheStub.calledOnce);
	t.true(taggedCacheStub.calledWith('tag:markers_user:1', 0, `markers_prevUser:1_borders:${borders}_marker:${markers[2].id}`));
});


test.serial('It returns from cache previous page within specific boundaries', async t => {
	sinon.stub(cache, 'status').get(() => {
		return 'ready'
	});
	sinon.stub(cache, 'exists').returns(true);
	const taggedCacheStub = sinon.stub(cache.store, 'zadd');
	const cacheSetStub = sinon.stub(cache.store, 'set');

	const markers = await MarkerFactory.create({
		user_id: 1,
		lat: 0.5,
		lng: 0.6
	}, 6);

	await MarkerFactory.create({
		user_id: 1,
		lat: 2,
		lng: -2
	}, 3);

	const borders = JSON.stringify([{lat: 0, lng: 0}, {lat: 1, lng: 1}]);
	sinon.stub(cache.store, 'get').returns(JSON.stringify({
		markers: [
			markers[3],
			markers[4],
			markers[5],
		],
		pagination: {
			hasNext: null,
			page: null
		}
	}));
	const response = await request(app).get(
		`/api/marker/nur/${markers[2].id}/previous?borders=${borders}`
	);
	const responseMarkers = response.body.markers;
	t.is(responseMarkers.length, 3);
	t.not(undefined, responseMarkers.find((item) => {
		return item.id === markers[3].id;
	}));
	t.not(undefined, responseMarkers.find((item) => {
		return item.id === markers[4].id;
	}));
	t.not(undefined, responseMarkers.find((item) => {
		return item.id === markers[5].id;
	}));

	t.is(response.body.pagination.hasNext, null);
	t.is(response.body.pagination.page, null);

	t.false(cacheSetStub.called);
	t.true(taggedCacheStub.calledOnce);
	t.true(taggedCacheStub.calledWith('tag:markers_user:1', 0, `markers_prevUser:1_borders:${borders}_marker:3`));
});
