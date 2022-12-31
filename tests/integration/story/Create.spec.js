import test from 'ava';
import app from '../../../app.js';
import request from 'supertest';
import helpers from '../../Helpers.js';
import Story from '../../../App/Models/Story.js';
import sinon from "sinon";
import cache from "../../../App/Services/CacheService.js";
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

test.serial('It prevents not logged from creating story', async t => {
	const response = await request(app).post('/api/story').send({
		name: 'bla',
	});

	t.is(response.status, 403);
	t.deepEqual(response.body, {
		message: "No user.",
		clearToken: true
	});
	t.is(await Story.count(), 0);
});

test.serial('It validates data', async t => {
	const response = await request(app).post('/api/story')
		.set('Cookie', await helpers.authorizedCookie('nur', '123456')).send({
			name: ''
		});

	t.is(response.status, 422);
	t.is(response.body.errors[0].param, 'name');

	t.is(await Story.count(), 0);

});

test.serial('It creates a story and flushes cache', async t => {
	const flushStub = sinon.stub();
	const taggedCacheStub = sinon.stub(cache, 'tag').returns({
		flush: flushStub
	});

	const response = await request(app).post('/api/story')
		.set('Cookie', await helpers.authorizedCookie('nur', '123456')).send({
			name: 'story'
		});

	const story = await Story.findOne();

	t.is(response.status, 201);
	t.is(response.body.user_id, 1);
	t.is(response.body.name, 'story');
	t.is(story.user_id, 1);
	t.is(story.name, 'story');

	t.true(taggedCacheStub.calledOnce);
	t.true(taggedCacheStub.calledWith(['stories_user:1']));
	t.true(flushStub.calledOnce);
});
