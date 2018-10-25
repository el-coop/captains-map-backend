import test from 'ava';
import app from '../../../app';
import knex from '../../../database/knex';
import MediaFactory from '../../../database/factories/MediaFactory';
import request from 'supertest';
import sinon from 'sinon';
import httpService from '../../../App/Services/HttpService';
import Cache from '../../../App/Services/CacheService';

test.beforeEach(async () => {
	await knex.migrate.latest();
	await knex.seed.run();
});

test.afterEach.always(async () => {
	sinon.restore();
	await knex.migrate.rollback();
});

test.serial('It returns Instagram data results from api', async t => {
	sinon.stub(Cache, 'exists').callsFake(() => {
		return false;
	});
	const httpStub = sinon.stub(httpService, 'get').callsFake(() => {
		return {
			status: 200,
			data: {
				message: 'fake data'
			}
		}
	});
	const media = await MediaFactory.create();

	const response = await request(app).get(`/api/marker/instagram/${media.id}`);
	t.is(response.status, 200);
	t.is(response.body.message, 'fake data');
	t.true(httpStub.calledOnce)
});

test.serial('It returns data from cache', async t => {
	const httpStub = sinon.stub(httpService, 'get');
	const cacheStub = sinon.stub(Cache, 'remember').callsFake(() => {
		return {
			message: 'fake data'
		}
	});

	const media = await MediaFactory.create();

	const response = await request(app).get(`/api/marker/instagram/${media.id}`);
	t.is(response.status, 200);
	t.is(response.body.message, 'fake data');
	t.false(httpStub.called);
	t.true(cacheStub.called);
});

test.serial('It throws error when httpService fails', async t => {
	sinon.stub(httpService, 'get').callsFake(() => {
		return {
			status: 404,
			data: {
				message: 'fake data'
			}
		}
	});
	sinon.stub(Cache, 'exists').callsFake(() => {
		return false;
	});


	const media = await MediaFactory.create();

	const response = await request(app).get(`/api/marker/instagram/${media.id}`);
	t.is(response.status, 500);
	t.is(response.body.message, 'An error occurred with the Instagram API');
});