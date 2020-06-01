import test from 'ava';
import app from '../../../app';
import knex from '../../../database/knex';
import request from 'supertest';
import helpers from '../../Helpers';
import sinon from "sinon";
import StoryFactory from "../../../database/factories/StoryFactory";
import MarkerFactory from "../../../database/factories/MarkerFactory";
import MediaFactory from "../../../database/factories/MediaFactory";
import UserFactory from "../../../database/factories/UserFactory";

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
	const response = await request(app).get(`/api/story/${story.id + 10}`);

	t.is(response.status, 404);
});

test.serial('It returns 404 when not logged in and story not published', async t => {
	const response = await request(app).get(`/api/story/${unpublishedStory.id}`);

	t.is(response.status, 404);
});

test.serial('It returns 404 when story unpublished and not correct user', async t => {
	const otherUser = await UserFactory.create({
		password: '123456'
	});

	const response = await request(app).get(`/api/story/${unpublishedStory.id}`)
		.set('Cookie', await helpers.authorizedCookie(otherUser.get('username'), '123456')).send();

	t.is(response.status, 404);
});

test.serial('It returns published story markers when requested', async t => {

	const markers = await MarkerFactory.create({
		user_id: 1,
		story_id: story.get('id')
	}, 5);

	const response = await request(app).get(`/api/story/${story.id}`);

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

	const response = await request(app).get(`/api/story/${story.id}`);

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

	const response = await request(app).get(`/api/story/${unpublishedStory.id}`)
		.set('Cookie', await helpers.authorizedCookie('nur', '123456')).send();

	t.is(response.status, 200);
	t.is(response.body.name, unpublishedStory.get('name'));
	t.is(response.body.published, 0);

	markers.forEach((marker, index) => {
		t.is(response.body.markers[index].id, marker.get('id'));
		t.is(response.body.markers[index].description, marker.get('description'));
	});
});
