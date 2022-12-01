import test from 'ava';
import sinon from 'sinon';
import knex from "../../database/knex.js";
import request from "supertest";
import app from "../../app.js";
import cache from "../../App/Services/CacheService.js";
import UserFactory from "../../database/factories/UserFactory.js";
import FollowFactory from "../../database/factories/FollowerFactory.js";
import Follower from "../../App/Models/Follower.js";

test.beforeEach(async () => {
	await knex.migrate.latest();
	await knex.seed.run();
});

test.afterEach.always('Restore sinon', async t => {
	await knex.migrate.rollback();
	sinon.restore();
});

test.serial('It returns public key', async t => {
	const response = await request(app).get('/api/follow/key');

	t.is(response.status, 200);
	t.deepEqual(response.body, {
		key: process.env.VAPID_PUBLIC_KEY
	});

});

test('It returns users followed and caches', async t => {
	sinon.stub(cache, 'exists').returns(false);
	const cacheSetStub = sinon.stub(cache.store, 'set');

	const endpoint = 'endpoint';
	const user1 = await UserFactory.create({
		username: 'test',
	});
	const user2 = await UserFactory.create({
		username: 'testa',
	});

	await FollowFactory.create({
		user_id: user1.id,
		endpoint
	});
	await FollowFactory.create({
		user_id: user2.id,
		endpoint
	});

	const response = await request(app).get(`/api/follow?endpoint=${endpoint}`);

	t.is(response.status, 200);
	t.deepEqual(response.body, [
		'test', 'testa'
	]);

	t.true(cacheSetStub.calledOnce);
	t.true(cacheSetStub.calledWith(endpoint, JSON.stringify([
		'test', 'testa'
	])));

});


test.serial('It returns users from cache', async t => {
	const endpoint = 'endpoint';
	sinon.stub(cache, 'rememberForever').returns([
		'user1', 'user2'
	]);
	const response = await request(app).get(`/api/follow?endpoint=${endpoint}`);

	t.is(response.status, 200);
	t.deepEqual(response.body, [
		'user1', 'user2'
	]);

});

test.serial('It toggles following on', async t => {
	const endpoint = 'https://endpoint.com';
	const cacheStub = sinon.stub(cache, 'forget');

	const subscription = {
		endpoint,
		keys: {
			key: 'key'
		}
	};

	const response = await request(app).post(`/api/follow/toggleFollow/nur`)
		.send({
			subscription
		});

	t.is(response.status, 201);
	t.deepEqual(response.body, {
		success: true
	});

	const follower = await new Follower().where('endpoint', endpoint).fetch();

	t.is(follower.get('endpoint'), endpoint);
	t.deepEqual(follower.get('subscription'), subscription);
	t.true(cacheStub.calledTwice);
	t.true(cacheStub.firstCall.calledWith(endpoint));
	t.true(cacheStub.secondCall.calledWith(`followers_1`));
});

test.serial('It toggles following off', async t => {
	const endpoint = 'https://endpoint.com';
	const cacheStub = sinon.stub(cache, 'forget');

	await FollowFactory.create({
		user_id: 1,
		endpoint
	});

	const subscription = {
		endpoint,
		keys: {
			key: 'key'
		}
	};

	const response = await request(app).post(`/api/follow/toggleFollow/nur`)
		.send({
			subscription
		});

	t.is(response.status, 200);
	t.deepEqual(response.body, {
		success: true
	});

	const follower = await new Follower().where('endpoint', endpoint).fetch({
		require: false
	});

	t.is(follower, null);
	t.true(cacheStub.calledTwice);
	t.true(cacheStub.firstCall.calledWith(endpoint));
	t.true(cacheStub.secondCall.calledWith(`followers_1`));
});

test.serial('It validates data', async t => {
	const endpoint = 'endpoint';

	const subscription = {
		endpoint,
		keys: 'key'
	};

	const response = await request(app).post(`/api/follow/toggleFollow/nur`)
		.send({
			subscription
		});

	t.is(response.status, 422);
	t.is(response.body.errors[0].param, 'subscription.endpoint');
	t.is(response.body.errors[1].param, 'subscription.keys');

});
