import test from 'ava';
import app from '../../../app.js';
import MediaFactory from '../../../database/factories/MediaFactory.js';
import request from 'supertest';
import sinon from 'sinon';
import httpService from '../../../App/Services/HttpService.js';
import Cache from '../../../App/Services/CacheService.js';
import migrator from "../../Migrator.js";
import seeder from "../../Seeder.js";

test.beforeEach(async () => {
	await migrator.up();
	await seeder.up();
});

test.afterEach.always(async () => {
	await migrator.down({to: '20180814134813_create_users_table'});
	await seeder.down({to: 0});
	sinon.restore();
});

test.serial('It returns and caches Instagram data results from api', async t => {
	sinon.stub(Cache, 'exists').returns(false);
	const cacheStub = sinon.stub(Cache.store, 'setex');

	const httpStub = sinon.stub(httpService, 'get')

	httpStub.onCall(0).returns({
		status: 200,
		data: 'data "EmbeddedMediaImage" src="stuff"'
	});

	httpStub.onCall(1).returns({
		headers: {
			'content-type': 'text/html',
		},
		status: 200,
		data: 'fake data'

	});

	const media = await MediaFactory.create();

	const response = await request(app).get(`/api/marker/instagram/p/${media.path}`);
	t.is(response.status, 200);
	t.is(response.text, 'fake data');
	t.true(httpStub.calledTwice);
	t.true(cacheStub.calledOnce);
	t.true(cacheStub.firstCall.calledWith(`instagram:${media.path}`, 60 * 60 * 12, JSON.stringify({
		data: 'fake data',
		headers: {
			'content-type': 'text/html',
		},
	})));
});

test.serial('It returns data from cache', async t => {
	sinon.stub(Cache, 'status').get(() => {
		return 'ready'
	});
	sinon.stub(Cache, 'exists').returns(true);
	const httpStub = sinon.stub(httpService, 'get');
	sinon.stub(Cache.store, 'get').returns(JSON.stringify({
		headers: {
			'content-type': 'text/html',
		},
		data: 'fake data'
	}));

	const media = await MediaFactory.create();

	const response = await request(app).get(`/api/marker/instagram/p/${media.id}`);
	t.is(response.status, 200);
	t.is(response.text, 'fake data');
	t.false(httpStub.called);
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

	const response = await request(app).get(`/api/marker/instagram/reel/${media.id}`);
	t.is(response.status, 500);
	t.is(response.body.message, 'An error occurred with the Instagram API');
});
