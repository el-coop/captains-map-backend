import test from 'ava';
import app from '../../../app';
import knex from '../../../database/knex';
import request from 'supertest';

test.beforeEach(async () => {
	await knex.migrate.latest();
	await knex.seed.run();
});

test.afterEach.always(async () => {
	await knex.migrate.rollback();
});


test.serial('Logs out user and deletes cookie', async t => {
	const response = await request(app).get('/api/auth/logout');

	const regex = RegExp(/token=.*Expires=Thu, 01 Jan 1970 00:00:00 GMT/);

	t.true(regex.test(response.headers['set-cookie'][0]));
	t.is(response.status, 200);
	t.is(response.body.status, 'success');
});
