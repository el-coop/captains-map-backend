import test from 'ava';
import app from '../../../app.js';
import knex from '../../../database/knex.js';
import request from 'supertest';
import helpers from '../../Helpers.js';
import Story from '../../../App/Models/Story.js';
import sinon from "sinon";
import cache from "../../../App/Services/CacheService.js";
import StoryFactory from "../../../database/factories/StoryFactory.js";
import UserFactory from "../../../database/factories/UserFactory.js";

let story;

test.beforeEach(async () => {
	await knex.migrate.latest();
	await knex.seed.run();

	story = await StoryFactory.create({
		user_id: 1,
	});
});

test.afterEach.always(async () => {
	await knex.migrate.rollback();
	sinon.restore();
});

test.serial('It prevents not logged from updating story', async t => {
	const response = await request(app).patch(`/api/story/${story.id}`).send({
		name: 'name'
	});

	t.is(response.status, 403);
});


test.serial('It prevents other user from updating a story', async t => {
	const otherUser = await UserFactory.create({
		password: '123456'
	});

	const response = await request(app).patch(`/api/story/${story.id}`)
		.set('Cookie', await helpers.authorizedCookie(otherUser.get('username'), '123456')).send({
			name: 'name'
		});

	t.is(response.status, 403);
});

test.serial('It returns 404 if story doesnt exist', async t => {
	const response = await request(app).patch(`/api/story/${story.id + 1}`)
		.set('Cookie', await helpers.authorizedCookie('nur', '123456')).send({
			name: 'name'
		});

	t.is(response.status, 404);
});

test.serial('It validates data', async t => {
	const name = story.get('name');

	const response = await request(app).patch(`/api/story/${story.id}`)
		.set('Cookie', await helpers.authorizedCookie('nur', '123456')).send({
			name: '',
			published: ''
		});

	const updatedStory = await new Story().fetch();

	t.is(response.status, 422);
	t.is(response.body.errors[0].param, 'name');
	t.is(response.body.errors[1].param, 'published');

	t.is(await Story.count(), 1);
	t.is(updatedStory.get('user_id'), 1);
	t.is(updatedStory.get('name'), name);

});

test.serial('It updates a story and flushes cache', async t => {
	const flushStub = sinon.stub();
	const taggedCacheStub = sinon.stub(cache, 'tag').returns({
		flush: flushStub
	});

	const response = await request(app).patch(`/api/story/${story.id}`)
		.set('Cookie', await helpers.authorizedCookie('nur', '123456')).send({
			name: 'name',
			published: 1
		});

	const updatedStory = await new Story().fetch();

	t.is(response.status, 200);
	t.is(response.body.user_id, 1);
	t.is(response.body.name, 'name');
	t.is(await Story.count(), 1);
	t.is(updatedStory.get('user_id'), 1);
	t.is(updatedStory.get('name'), 'name');
	t.is(updatedStory.get('published'), 1);

	t.true(taggedCacheStub.calledOnce);
	t.true(taggedCacheStub.calledWith(['stories_user:1']));
	t.true(flushStub.calledOnce);

});
