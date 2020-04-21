import test from 'ava';
import app from '../../../app';
import knex from '../../../database/knex';
import request from 'supertest';
import helpers from '../../Helpers';
import Story from '../../../App/Models/Story';
import sinon from "sinon";
import cache from "../../../App/Services/CacheService";
import StoryFactory from "../../../database/factories/StoryFactory";
import UserFactory from "../../../database/factories/UserFactory";

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

test.serial('It prevents not logged from deleting story', async t => {
	const response = await request(app).delete(`/api/story/${story.id}`).send();

	t.is(response.status, 403);
});


test.serial('It prevents other user from deleting story', async t => {
	const otherUser = await UserFactory.create({
		password: '123456'
	});

	const response = await request(app).delete(`/api/story/${story.id}`)
		.set('Cookie', await helpers.authorizedCookie(otherUser.get('username'), '123456')).send();

	t.is(response.status, 403);
});

test.serial('It returns 404 if story doesnt exist', async t => {
	const response = await request(app).delete(`/api/story/${story.id + 1}`)
		.set('Cookie', await helpers.authorizedCookie('nur', '123456')).send();

	t.is(response.status, 404);
});


test.serial('It deletes a story and flushes cache', async t => {
	const flushStub = sinon.stub();
	const taggedCacheStub = sinon.stub(cache, 'tag').returns({
		flush: flushStub
	});

	const response = await request(app).delete(`/api/story/${story.id}`)
		.set('Cookie', await helpers.authorizedCookie('nur', '123456')).send();

	t.is(response.status, 200);
	t.is(0, await Story.count());
	t.true(taggedCacheStub.calledOnce);
	t.true(taggedCacheStub.calledWith(['stories_user:1']));
	t.true(flushStub.calledOnce);

});
