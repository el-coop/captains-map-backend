import test from 'ava';
import app from '../../../app';
import knex from '../../../database/knex';
import MarkerFactory from '../../../database/factories/MarkerFactory';
import request from 'supertest';
import sinon from 'sinon';
import httpService from '../../../services/HttpService';
import Cache from '../../../services/CacheService';

test.beforeEach(async () => {
	await knex.migrate.latest();
	await knex.seed.run();
});

test.afterEach.always(async () => {
	sinon.restore();
	await knex.migrate.rollback();
});

test.serial('It returns Instagram data results from api', async t => {
	const cacheStub = sinon.stub(Cache, 'exists').callsFake(() => {
		return false
	});
	const httpStub = sinon.stub(httpService, 'get').callsFake(() => {
		return {
			status: 200,
			data: {
				message: 'fake data'
			}
		}
	});
	const marker = await MarkerFactory.create({
		user_id: 1,
		created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000)
	});

	const response = await request(app).get('/api/marker/instagram/1');
	t.is(response.status, 200);
	t.is(response.body.message, 'fake data');
	t.true(httpStub.calledOnce)
});

test.serial('It returns data from cache', async t => {
	const httpStub = sinon.stub(httpService, 'get');
	sinon.stub(Cache, 'exists').callsFake(() => {
		return true;
	});
	const cacheStub = sinon.stub(Cache, 'remember').callsFake(() => {
		return {
			message: 'fake data'
		}
	});
	const marker = await MarkerFactory.create({
		user_id: 1,
		created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000)
	});

	const response = await request(app).get('/api/marker/instagram/1');
	t.is(response.status, 200);
	t.is(response.body.message, 'fake data');
	t.false(httpStub.called);
	t.true(cacheStub.called);
});

test.serial('It throws error when httpService fails',async t => {
	const httpStub = sinon.stub(httpService, 'get').callsFake(() => {
		return {
			status: 404,
			data: {
				message: 'fake data'
			}
		}
	});
	const cacheStub = sinon.stub(Cache, 'exists').callsFake(() => {
		return false
	});

	const marker = await MarkerFactory.create({
		user_id: 1,
		created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000)
	});

	const response = await request(app).get('/api/marker/instagram/1');
	t.is(response.status, 500);
	t.is(response.body.message, 'An error occurred with the Instagram API');
});