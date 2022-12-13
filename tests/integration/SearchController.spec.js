import test from 'ava';
import sinon from 'sinon';
import knex from "../../database/knex.js";
import request from "supertest";
import app from "../../app.js";
import helpers from "../Helpers.js";
import UserFactory from "../../database/factories/UserFactory.js";
import cache from "../../App/Services/CacheService.js";

test.beforeEach(async () => {
	await knex.migrate.latest();
	await knex.seed.run();
});

test.afterEach.always('Restore sinon', async t => {
	await knex.migrate.rollback();
	sinon.restore();
});

test.serial('It rejects unauthorized user', async t => {
	const response = await request(app).get('/api/search/users/test');

	t.is(response.status, 403);
	t.deepEqual(response.body, {
		message: "No user.",
		clearToken: true
	});
});

test.serial('It returns search with the similar answers and caches results', async t => {
	sinon.stub(cache, 'exists').returns(false);
	const cacheSetStub = sinon.stub(cache.store, 'set');
	const taggedCacheStub = sinon.stub(cache.store, 'zadd');

	await UserFactory.create({
		username: 'test',
	});
	await UserFactory.create({
		username: 'testa',
	});
	await UserFactory.create({
		username: 'atesta',
	});
	await UserFactory.create({
		username: 'atest',
	});
	const response = await request(app)
		.get('/api/search/users/test')
		.set('Cookie', await helpers.authorizedCookie('nur', '123456'));

	t.deepEqual(response.body, [
		'atest',
		'atesta',
		'test',
		'testa'
	]);

	t.true(cacheSetStub.calledOnce);
	t.true(cacheSetStub.calledWith('users_test'));
	t.true(taggedCacheStub.calledOnce);
	t.true(taggedCacheStub.calledWith('tag:user_search', 0, 'users_test'));
});

test.serial('It returns search from cache with the similar answers', async t => {
	sinon.stub(cache, 'status').get(() => {
		return 'ready'
	});
	sinon.stub(cache, 'exists').returns(true);
	const cacheSetStub = sinon.stub(cache.store, 'set');
	const taggedCacheStub = sinon.stub(cache.store, 'zadd');

	await UserFactory.create({
		username: 'test',
	});
	await UserFactory.create({
		username: 'testa',
	});
	await UserFactory.create({
		username: 'atesta',
	});
	await UserFactory.create({
		username: 'atest',
	});
	sinon.stub(cache.store, 'get').returns(JSON.stringify([
		'atest',
		'atesta',
		'test',
		'testa'
	]));

	const response = await request(app)
		.get('/api/search/users/test')
		.set('Cookie', await helpers.authorizedCookie('nur', '123456'));

	t.deepEqual(response.body, [
		'atest',
		'atesta',
		'test',
		'testa'
	]);

	t.false(cacheSetStub.called);
	t.true(taggedCacheStub.calledOnce);
	t.true(taggedCacheStub.calledWith('tag:user_search', 0, 'users_test'));
});


test.serial('It doesnt return irrelevant items', async t => {
	sinon.stub(cache, 'exists').returns(false);
	sinon.stub(cache.store, 'set');
	sinon.stub(cache.store, 'zadd');

	await UserFactory.create({
		username: 'test',
	});
	await UserFactory.create({
		username: 'bla',
	});
	await UserFactory.create({
		username: 'gla',
	});
	await UserFactory.create({
		username: 'sla',
	});
	const response = await request(app)
		.get('/api/search/users/test')
		.set('Cookie', await helpers.authorizedCookie('nur', '123456'));

	t.deepEqual(response.body, [
		'test',
	]);
	t.is(response.body.length, 1);
});
