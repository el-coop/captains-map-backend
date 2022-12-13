import test from 'ava';
import app from '../../../app.js';
import knex from '../../../database/knex.js';
import request from 'supertest';
import helpers from '../../Helpers.js';
import Story from '../../../App/Models/Story.js';
import sinon from "sinon";
import cache from "../../../App/Services/CacheService.js";
import StoryFactory from "../../../database/factories/StoryFactory.js";
import MarkerFactory from "../../../database/factories/MarkerFactory.js";
import UserFactory from "../../../database/factories/UserFactory.js";
import path from "path";
import fs from "fs";
import MediaFactory from "../../../database/factories/MediaFactory.js";
import Marker from "../../../App/Models/Marker.js";
import Media from "../../../App/Models/Media.js";

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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


test.serial('It deletes a story and its markers and flushes cache', async t => {
	await MarkerFactory.create({
		user_id: 1,
		story_id: story.get('id')
	});

	const mediaMarker = await MarkerFactory.create({
		user_id: 1,
		story_id: story.get('id')
	});

	const demoFilePath = path.resolve(__dirname, '../../demo.jpg');
	const filePath = path.resolve(__dirname, `../../../public/images/blabla`);
	const thumbPath = path.resolve(__dirname, `../../../public/thumbnails/blabla`);
	fs.copyFileSync(demoFilePath, filePath);
	fs.copyFileSync(demoFilePath, thumbPath);

	await MediaFactory.create({
		marker_id: mediaMarker.get('id'),
		type: 'image',
		path: `/images/blabla`
	})

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

	t.false(fs.existsSync(filePath));
	t.false(fs.existsSync(thumbPath));
	t.is(0, await Marker.count());
	t.is(0, await Media.count());
});
