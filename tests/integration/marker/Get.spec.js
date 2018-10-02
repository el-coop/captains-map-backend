import test from 'ava';
import app from '../../../app';
import knex from '../../../database/knex';
import MarkerFactory from '../../../database/factories/MarkerFactory';
import request from 'supertest';

test.beforeEach(async () => {
	await knex.migrate.latest();
	await knex.seed.run();
});

test.afterEach.always(async () => {
	await knex.migrate.rollback();
});

test.serial('It returns all existing markers with 1 pagination data sorted desc by id', async t => {
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

});

test.serial('It returns data in pages when there is much data', async t => {
	await MarkerFactory.create({
		user_id: 1
	}, 4);

	const response = await request(app).get('/api/marker');
	t.is(response.body.markers.length, 3);
	t.true(response.body.pagination.hasNext);
});

test.serial('It returns data after id when there id is specified', async t => {
	const markers = await MarkerFactory.create({
		user_id: 1
	}, 5);

	const response = await request(app).get(`/api/marker?startingId=${markers[2].id}`);
	t.is(response.body.markers.length, 2);
	t.is(response.body.markers[1].id, markers[0].id);
	t.is(response.body.markers[0].id, markers[1].id);
	t.false(response.body.pagination.hasNext);
});

test.serial('It returns only markers of specific user with hasNext false when one page ', async t => {
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
});

test.serial('It returns only markers of specific user after specific id when specified', async t => {
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
	t.not(response.body.markers.find((item) => {
		return item.id === userFirstMarkers[2].id;
	}), null);
	t.not(response.body.markers.find((item) => {
		return item.id === userFirstMarkers[1].id;
	}), null);
	t.not(response.body.markers.find((item) => {
		return item.id === userSecondMarkers[0].id;
	}), null);
	t.true(response.body.pagination.hasNext);
});

test.serial('It returns only markers of specific user with hasNext true when more than one page', async t => {
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


test('It returns 404 for unknown user', async t => {
	const response = await request(app).get('/api/marker/bla');

	t.is(response.status, 404);
	t.is(response.body.message, 'Not Found');
});