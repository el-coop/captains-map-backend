import test from 'ava';
import app from '../../../app';
import knex from '../../../database/knex';
import User from '../../../App/Models/User';
import request from 'supertest';
import sinon from "sinon";
import cache from "../../../App/Services/CacheService";


test.beforeEach(async () => {
	await knex.migrate.latest();
});

test.afterEach.always(async () => {
	await knex.migrate.rollback();
	sinon.restore();
});


test.serial('Return registration closed message for registration when users exist', async t => {
	await knex.seed.run();
	const response = await request(app).post('/api/auth/register').send({
		username: 'nur',
		password: '123456',
		email: 'lcd344@yahoo.com'
	});

	t.is(response.status, 403);
	t.is(response.body.message, 'Registration is closed');
});

test.serial('First user registers successfully and flushes users', async t => {
	const flushStub = sinon.stub();
	const taggedCacheStub = sinon.stub(cache, 'tag').returns({
		flush: flushStub
	});

	const response = await request(app).post('/api/auth/register').send({
		username: 'nur',
		password: '123456',
		email: 'lcd344@yahoo.com'
	});

	t.is(response.status, 200);
	t.is(response.body.success, true);

	let user = await new User().fetch({id: 1});
	t.is(user.username, 'nur');
	t.true(taggedCacheStub.calledOnce);
	t.true(taggedCacheStub.calledWith(['user_search']));
	t.true(flushStub.calledOnce);
});

test.serial('Validates user data before registration', async t => {
	await knex.seed.run();
	const response = await request(app).post('/api/auth/register').send({
		username: '',
		email: '',
		password: ''
	});

	t.is(response.status, 422);
	t.is(response.body.errors[0].param, 'username');
	t.is(response.body.errors[1].param, 'password');
	t.is(response.body.errors[2].param, 'email');
});
