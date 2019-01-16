import test from 'ava';
import sinon from 'sinon';
import path from 'path';
import request from "supertest";

import app from "../../../app";
import knex from "../../../database/knex";
import UserFactory from '../../../database/factories/UserFactory';
import BioFactory from '../../../database/factories/BioFactory';
import helpers from "../../Helpers";
import Bio from "../../../App/Models/Bio";
import fs from 'fs';
import cache from "../../../App/Services/CacheService";

test.beforeEach(async () => {
	await knex.migrate.latest();
	await knex.seed.run();
});

test.afterEach.always('Restore sinon', async () => {
	await knex.migrate.rollback();
	sinon.restore();
});

test('It returns empty when the user has no bio and caches', async t => {
	sinon.stub(cache, 'exists').returns(false);
	const cacheSetStub = sinon.stub(cache.store, 'set');

	const response = await request(app).get('/api/bio/nur');

	t.deepEqual(response.body, {
		description: '',
		path: null
	});

	t.true(cacheSetStub.calledOnce);
	t.true(cacheSetStub.calledWith('bio:1'));
});

test('It returns 404 for non existent user get', async t => {
	const response = await request(app).get('/api/bio/dio');

	t.is(response.status, 404);
});

test('It returns bio for getting existing user with bio and caches', async t => {
	sinon.stub(cache, 'exists').returns(false);
	const cacheSetStub = sinon.stub(cache.store, 'set');

	const bio = await BioFactory.create({
		user_id: 1
	});
	const response = await request(app).get('/api/bio/nur');


	t.deepEqual(response.body, {
		path: bio.path,
		description: bio.description,
	});

	t.true(cacheSetStub.calledOnce);
	t.true(cacheSetStub.calledWith('bio:1'));
});

test('It returns bio from cache for getting existing user with bio', async t => {
	sinon.stub(cache, 'exists').returns(true);
	const cacheSetStub = sinon.stub(cache.store, 'set');

	const bio = await BioFactory.create({
		user_id: 1
	});

	sinon.stub(cache.store, 'get').returns(JSON.stringify({
		bio
	}));
	const response = await request(app).get('/api/bio/nur');


	t.deepEqual(response.body, {
		path: bio.path,
		description: bio.description,
	});

	t.false(cacheSetStub.called);
});

test('It prevents guests from editing users bio', async t => {
	const response = await request(app).post('/api/bio/nur').send({
		description: 'testdesc'
	});

	t.is(response.status, 403);
});


test('It prevents other user from editing users bio', async t => {
	const otherUser = await UserFactory.create({
		password: '123456'
	});
	const response = await request(app).post('/api/bio/nur')
		.set('Cookie', await helpers.authorizedCookie(otherUser.username, '123456'))
		.send({
			description: 'testdesc'
		});

	t.is(response.status, 403);
});

test('It uploads photo and creates bio when non is present and deletes cached data', async t => {
	const forgetCacheStub = sinon.stub(cache, 'forget');

	const response = await request(app).post('/api/bio/nur')
		.set('Cookie', await helpers.authorizedCookie('nur', '123456'))
		.attach('image', path.resolve(__dirname, '../../demo.jpg'))
		.field('description', 'testdesc');

	const bio = await new Bio().fetch();
	const filePath = path.resolve(__dirname, `../../../public${response.body.path}`);

	t.is(response.status, 200);
	t.is(response.body.description, 'testdesc');
	t.true(fs.existsSync(filePath));

	t.is(bio.user_id, 1);
	t.is(bio.path, response.body.path);
	t.is(bio.description, 'testdesc');

	fs.unlinkSync(filePath);
	t.true(forgetCacheStub.calledOnce);
	t.true(forgetCacheStub.calledWith('bio:1'));
});

test('It saves only description when only description is given and deletes cached data', async t => {
	const forgetCacheStub = sinon.stub(cache, 'forget');

	const response = await request(app).post('/api/bio/nur')
		.set('Cookie', await helpers.authorizedCookie('nur', '123456'))
		.field('description', 'testdesc');

	const bio = await new Bio().fetch();

	t.is(response.status, 200);
	t.is(response.body.description, 'testdesc');
	t.is(response.body.path, null);

	t.is(bio.user_id, 1);
	t.is(bio.path, null);
	t.is(bio.description, 'testdesc');
	t.true(forgetCacheStub.calledOnce);
	t.true(forgetCacheStub.calledWith('bio:1'));
});

test('It updates only description when only description is given and flushes ild data', async t => {
	const forgetCacheStub = sinon.stub(cache, 'forget');

	const oldBio = await BioFactory.create({
		user_id: 1
	});
	const response = await request(app).post('/api/bio/nur')
		.set('Cookie', await helpers.authorizedCookie('nur', '123456'))
		.field('description', 'testdesc');

	const bio = await new Bio().fetch();

	t.is(response.status, 200);
	t.is(response.body.description, 'testdesc');
	t.is(response.body.path, oldBio.path);

	t.is(bio.user_id, 1);
	t.is(bio.path, oldBio.path);
	t.is(bio.description, 'testdesc');
	t.true(forgetCacheStub.calledOnce);
	t.true(forgetCacheStub.calledWith('bio:1'));
});


test('It updates bio and deletes old image and deletes old data', async t => {
	const forgetCacheStub = sinon.stub(cache, 'forget');

	const oldBio = await BioFactory.create({
		user_id: 1
	});
	const demoFilePath = path.resolve(__dirname, '../../demo.jpg');
	const oldFilePath = path.resolve(__dirname, `../../../public${oldBio.path}`);
	fs.copyFileSync(demoFilePath, oldFilePath);

	const response = await request(app).post('/api/bio/nur')
		.set('Cookie', await helpers.authorizedCookie('nur', '123456'))
		.attach('image', demoFilePath)
		.field('description', 'testdesc');

	const bio = await new Bio().fetch();
	const filePath = path.resolve(__dirname, `../../../public${response.body.path}`);

	t.is(response.status, 200);
	t.is(response.body.description, 'testdesc');
	t.true(fs.existsSync(filePath));
	t.false(fs.existsSync(oldFilePath));

	t.is(bio.user_id, 1);
	t.is(bio.path, response.body.path);
	t.is(bio.description, 'testdesc');
	fs.unlinkSync(filePath);
	t.true(forgetCacheStub.calledOnce);
	t.true(forgetCacheStub.calledWith('bio:1'));
});
