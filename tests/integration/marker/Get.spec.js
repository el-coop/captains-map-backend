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

test.serial('It returns all existing markers sorted asc by created date', async t => {
	const marker0 = await MarkerFactory.create({
		user_id: 1,
		created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000)
	});
	const marker1 = await MarkerFactory.create({
		user_id: 1,
	});
	const marker2 = await MarkerFactory.create({
		user_id: 1,
		created_at: new Date(Date.now() - 4 * 24 * 3600 * 1000)
	});

	const response = await request(app).get('/api/marker');
	t.is(response.body.length, 3);
	t.is(response.body[1].id, marker0.id);
	t.is(response.body[0].id, marker2.id);
	t.is(response.body[2].id, marker1.id);
});

test.serial('It returns only markers of specific user', async t => {
	const marker0 = await MarkerFactory.create({
		user_id: 1,
	});
	const marker1 = await MarkerFactory.create({
		user_id: 1,
	});
	const marker2 = await MarkerFactory.create({
		user_id: 2,
		created_at: new Date(Date.now() - 4 * 24 * 3600 * 1000)
	});

	const response = await request(app).get('/api/marker/nur');
	t.is(response.body.length, 2);
	t.is(response.body[0].id, marker0.id);
	t.is(response.body[1].id, marker1.id);
});

test('It returns 404 for unknown user', async t => {
	const response = await request(app).get('/api/marker/bla');

	t.is(response.status, 404);
	t.is(response.body.message, 'Not Found');
});