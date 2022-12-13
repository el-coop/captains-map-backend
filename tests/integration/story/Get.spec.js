import test from 'ava';
import app from '../../../app.js';
import knex from '../../../database/knex.js';
import request from 'supertest';
import helpers from '../../Helpers.js';
import sinon from "sinon";
import StoryFactory from "../../../database/factories/StoryFactory.js";
import MarkerFactory from "../../../database/factories/MarkerFactory.js";
import MediaFactory from "../../../database/factories/MediaFactory.js";
import UserFactory from "../../../database/factories/UserFactory.js";

let story;
let unpublishedStory;

test.beforeEach(async () => {
	await knex.migrate.latest();
	await knex.seed.run();

	story = await StoryFactory.create({
		user_id: 1,
		published: true
	});

	unpublishedStory = await StoryFactory.create({
		user_id: 1,
		published: false
	});
});

test.afterEach.always(async () => {
	await knex.migrate.rollback();
	sinon.restore();
});

test.serial('It returns 404 for a story that doesnt exist', async t => {
	const response = await request(app).get(`/api/story/nur/${story.id + 10}`);

	t.is(response.status, 404);
});

test.serial('It returns 404 for a story with non existing username', async t => {

	const response = await request(app).get(`/api/story/test/${story.id}`);

	t.is(response.status, 404);
});

test.serial('It returns 404 for a story with existing username that doesnt own', async t => {
	await UserFactory.create({
		username: 'test',
	});

	const response = await request(app).get(`/api/story/test/${story.id}`);

	t.is(response.status, 404);
});

test.serial('It returns 404 when not logged in and story not published', async t => {
	const response = await request(app).get(`/api/story/nur/${unpublishedStory.id}`);

	t.is(response.status, 404);
});

test.serial('It returns 404 when story unpublished and not correct user', async t => {
	const otherUser = await UserFactory.create({
		password: '123456'
	});

	const response = await request(app).get(`/api/story/nur/${unpublishedStory.id}`)
		.set('Cookie', await helpers.authorizedCookie(otherUser.get('username'), '123456')).send();

	t.is(response.status, 404);
});

test.serial('It returns published story markers when requested', async t => {

	const markers = await MarkerFactory.create({
		user_id: 1,
		story_id: story.get('id')
	}, 5);

	const response = await request(app).get(`/api/story/nur/${story.id}`);

	t.is(response.status, 200);
	t.is(response.body.name, story.get('name'));
	t.is(response.body.published, 1);
	t.deepEqual(response.body.cover, null);

	markers.forEach((marker, index) => {
		t.is(response.body.markers[index].id, marker.get('id'));
		t.is(response.body.markers[index].description, marker.get('description'));
		t.is(response.body.markers[index].description, marker.get('description'));
	});
});

test.serial('It returns story with cover data', async t => {

	const markers = await MarkerFactory.create({
		user_id: 1,
		story_id: story.get('id')
	}, 5);

	await MediaFactory.create({
		marker_id: markers[0].id
	});

	const response = await request(app).get(`/api/story/nur/${story.id}`);

	t.is(response.status, 200);
	t.is(response.body.name, story.get('name'));
	t.is(response.body.published, 1);
	t.deepEqual(response.body.cover, {
		path: 'BlfyEoTDKxi',
		type: 'instagram'
	});

	markers.forEach((marker, index) => {
		t.is(response.body.markers[index].id, marker.get('id'));
		t.is(response.body.markers[index].description, marker.get('description'));
		t.is(response.body.markers[index].description, marker.get('description'));
	});
});

test.serial('It returns unpublished story markers when requested', async t => {

	const markers = await MarkerFactory.create({
		user_id: 1,
		story_id: unpublishedStory.get('id')
	}, 5);

	const response = await request(app).get(`/api/story/nur/${unpublishedStory.id}`)
		.set('Cookie', await helpers.authorizedCookie('nur', '123456')).send();

	t.is(response.status, 200);
	t.is(response.body.name, unpublishedStory.get('name'));
	t.is(response.body.published, 0);

	markers.forEach((marker, index) => {
		t.is(response.body.markers[index].id, marker.get('id'));
		t.is(response.body.markers[index].description, marker.get('description'));
	});
});
