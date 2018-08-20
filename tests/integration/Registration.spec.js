import test from 'ava';
import app from '../../app';
import knex from '../../database/knex';
import User from '../../models/User';
import request from 'supertest';


test.beforeEach(async () => {
	await knex.migrate.latest();
});

test.afterEach.always(async () => {
	await knex.migrate.rollback();
});


test.serial('Return registration closed message for registration when users exist', async t => {
	t.plan(2);
	await knex.seed.run();
	const response = await request(app).post('/api/auth/register').send({
		username: 'nur',
		password: 123456
	});

	t.is(response.status, 403);
	t.is(response.body.message, 'Registration is closed');
});

test.serial('First user registers successfully', async t => {
	t.plan(3);
	const response = await request(app).post('/api/auth/register').send({
		username: 'nur',
		password: '123456'
	});

	t.is(response.status, 200);
	t.is(response.body.success, true);

	let user = await new User().fetch({id: 1});
	t.is(user.username, 'nur');
});

test.serial('Validates user data before registration', async t => {
	t.plan(3);
	await knex.seed.run();
	const response = await request(app).post('/api/auth/register').send({
		username: '',
		password: ''
	});

	t.is(response.status, 422);
	t.is(response.body.errors[0].param, 'username');
	t.is(response.body.errors[1].param, 'password');
});