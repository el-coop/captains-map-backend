import test from 'ava';
import sinon from 'sinon';
import path from 'path';
import request from "supertest";

import app from "../../../app";
import knex from "../../../database/knex";
import BioFactory from '../../../database/factories/BioFactory';
import StoryFactory from '../../../database/factories/StoryFactory';
import MarkerFactory from '../../../database/factories/MarkerFactory';
import MediaFactory from '../../../database/factories/MediaFactory';
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
		path: null,
		stories: []
	});

	t.true(cacheSetStub.calledTwice);
	t.true(cacheSetStub.calledWith('bio:1'));
	t.true(cacheSetStub.calledWith('stories:1'));
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
		path: bio.get('path'),
		description: bio.get('description'),
		stories: []
	});

	t.true(cacheSetStub.calledTwice);
	t.true(cacheSetStub.calledWith('bio:1'));
	t.true(cacheSetStub.calledWith('stories:1'));
});

test('It returns bio with published stories when getting existing user with bio and users and caches', async t => {
	sinon.stub(cache, 'exists').returns(false);
	const cacheSetStub = sinon.stub(cache.store, 'set');

	const bio = await BioFactory.create({
		user_id: 1
	});

	const stories = await StoryFactory.create({
		user_id: 1,
		published: 1
	}, 3);

	const mediaStory = stories[(Math.floor(Math.random() * stories.length))].id;

	const markers = await MarkerFactory.create({
		user_id: 1,
		story_id: mediaStory
	}, 2);


	for (let markerIndex = 0; markerIndex < markers.length; markerIndex++) {
		const marker = markers[markerIndex];

		await MediaFactory.create({
			marker_id: marker.get('id')
		});
	}

	await StoryFactory.create({
		user_id: 1,
		published: 0
	}, 2);

	const response = await request(app).get('/api/bio/nur');

	t.is(response.body.path, bio.get('path'));
	t.is(response.body.description, bio.get('description'));
	t.is(response.body.stories.length, 3);

	for (let storyIndex = 0; storyIndex < stories.length; storyIndex++) {
		const story = stories[storyIndex];

		await story.load('markers');
		const marker = story.related('markers').get(0);
		let media = null;
		if (marker) {
			await marker.load('media');
			media = marker.related('media').get(0);
		}

		t.deepEqual(response.body.stories[Math.abs(2 - storyIndex)], {
			id: story.get('id'),
			name: story.get('name'),
			published: 1,
			cover: {
				path: mediaStory === story.get('id') ? 'BlfyEoTDKxi' : null,
				type: mediaStory === story.get('id') ? 'instagram' : null
			}
		});
	}

	t.true(cacheSetStub.calledTwice);
	t.true(cacheSetStub.calledWith('bio:1'));
	t.true(cacheSetStub.calledWith('stories:1'));
});


test('It returns bio with published and unpublished stories when logged in getting existing user with bio and users and caches', async t => {
	sinon.stub(cache, 'exists').returns(false);
	const cacheSetStub = sinon.stub(cache.store, 'set');

	const bio = await BioFactory.create({
		user_id: 1
	});

	const stories = await StoryFactory.create({
		user_id: 1,
		published: 1
	}, 3);

	stories.push(...await StoryFactory.create({
		user_id: 1,
		published: 0
	}, 2));

	const mediaStory = stories[(Math.floor(Math.random() * stories.length))].id;

	const markers = await MarkerFactory.create({
		user_id: 1,
		story_id: mediaStory
	}, 2);


	for (let markerIndex = 0; markerIndex < markers.length; markerIndex++) {
		const marker = markers[markerIndex];

		await MediaFactory.create({
			marker_id: marker.get('id')
		});
	}

	const response = await request(app).get('/api/bio/nur')
		.set('Cookie', await helpers.authorizedCookie('nur', '123456'));

	t.is(response.body.path, bio.get('path'));
	t.is(response.body.description, bio.get('description'));
	t.is(response.body.stories.length, 5);

	stories.forEach((story, index) => {
		t.deepEqual(response.body.stories[Math.abs(4 - index)], {
			id: story.get('id'),
			name: story.get('name'),
			published: story.get('published'),
			cover: {
				path: mediaStory === story.get('id') ? 'BlfyEoTDKxi' : null,
				type: mediaStory === story.get('id') ? 'instagram' : null
			}
		});
	});


	t.true(cacheSetStub.calledTwice);
	t.true(cacheSetStub.calledWith('bio:1'));
	t.true(cacheSetStub.calledWith('stories:1_unpublished'));
});


test('It returns bio from cache for getting existing user with bio', async t => {
	sinon.stub(cache, 'status').get(() => {
		return 'ready'
	});
	sinon.stub(cache, 'exists').returns(true);
	const cacheSetStub = sinon.stub(cache.store, 'set');

	const bio = await BioFactory.create({
		user_id: 1
	});

	sinon.stub(cache.store, 'get').onFirstCall().returns(JSON.stringify({
		path: bio.get('path'),
		description: bio.get('description')
	})).onSecondCall().returns(JSON.stringify([]));
	const response = await request(app).get('/api/bio/nur');


	t.deepEqual(response.body, {
		path: bio.get('path'),
		description: bio.get('description'),
		stories: []
	});

	t.false(cacheSetStub.called);
});

test('It returns bio and published stories from cache for getting existing user with bio', async t => {
	sinon.stub(cache, 'status').get(() => {
		return 'ready'
	});
	sinon.stub(cache, 'exists').returns(true);
	const cacheSetStub = sinon.stub(cache.store, 'set');

	const bio = await BioFactory.create({
		user_id: 1
	});

	const stories = [{
		id: 1,
		name: 'name',
		published: 1
	}, {
		id: 2,
		name: 'name1',
		published: 1
	}];

	const cacheGetStub = sinon.stub(cache.store, 'get').onFirstCall().returns(JSON.stringify({
		path: bio.get('path'),
		description: bio.get('description')
	})).onSecondCall().returns(JSON.stringify(stories));
	const response = await request(app).get('/api/bio/nur');

	t.deepEqual(response.body, {
		path: bio.get('path'),
		description: bio.get('description'),
		stories
	});

	t.false(cacheSetStub.called);
	t.true(cacheGetStub.calledWith('bio:1'));
	t.true(cacheGetStub.calledWith('stories:1'));
});

test('It returns bio with published and unpublished stories from cache for getting existing user with bio', async t => {
	sinon.stub(cache, 'status').get(() => {
		return 'ready'
	});
	sinon.stub(cache, 'exists').returns(true);
	const cacheSetStub = sinon.stub(cache.store, 'set');

	const bio = await BioFactory.create({
		user_id: 1
	});

	const stories = [{
		id: 1,
		name: 'name',
		published: 1
	}, {
		id: 2,
		name: 'name1',
		published: 0
	}];

	const cacheGetStub = sinon.stub(cache.store, 'get').onFirstCall().returns(JSON.stringify({
		path: bio.get('path'),
		description: bio.get('description')
	})).onSecondCall().returns(JSON.stringify(stories));
	const response = await request(app).get('/api/bio/nur')
		.set('Cookie', await helpers.authorizedCookie('nur', '123456'));

	t.deepEqual(response.body, {
		path: bio.get('path'),
		description: bio.get('description'),
		stories
	});

	t.false(cacheSetStub.called);
	t.true(cacheGetStub.calledWith('bio:1'));
	t.true(cacheGetStub.calledWith('stories:1_unpublished'));
});


test('It prevents guests from editing users bio', async t => {
	const response = await request(app).post('/api/bio').send({
		description: 'testdesc'
	});

	t.is(response.status, 403);
});

test('It uploads photo and creates bio when non is present and deletes cached data', async t => {
	const forgetCacheStub = sinon.stub(cache, 'forget');
	const flushStub = sinon.stub();
	const tagCacheStub = sinon.stub(cache, 'tag').returns({
		flush: flushStub
	});

	const response = await request(app).post('/api/bio')
		.set('Cookie', await helpers.authorizedCookie('nur', '123456'))
		.attach('image', path.resolve(__dirname, '../../demo.jpg'))
		.field('description', 'testdesc');

	const bio = await new Bio().fetch();
	const filePath = path.resolve(__dirname, `../../../public${response.body.path}`);

	t.is(response.status, 200);
	t.is(response.body.description, 'testdesc');
	t.true(fs.existsSync(filePath));

	t.is(bio.get('user_id'), 1);
	t.is(bio.get('path'), response.body.path);
	t.is(bio.get('description'), 'testdesc');

	fs.unlinkSync(filePath);
	t.true(forgetCacheStub.calledOnce);
	t.true(forgetCacheStub.calledWith('bio:1'));

	t.true(tagCacheStub.calledOnce);
	t.true(tagCacheStub.calledWith(['markers', `markers_user:1`]));
	t.true(flushStub.calledOnce);

});

test('It saves only description when only description is given and deletes cached data', async t => {
	const forgetCacheStub = sinon.stub(cache, 'forget');

	const response = await request(app).post('/api/bio')
		.set('Cookie', await helpers.authorizedCookie('nur', '123456'))
		.field('description', 'testdesc');

	const bio = await new Bio().fetch();

	t.is(response.status, 200);
	t.is(response.body.description, 'testdesc');
	t.is(response.body.path, null);

	t.is(bio.get('user_id'), 1);
	t.is(bio.get('path'), null);
	t.is(bio.get('description'), 'testdesc');
	t.true(forgetCacheStub.calledOnce);
	t.true(forgetCacheStub.calledWith('bio:1'));
});

test('It updates only description when only description is given and flushes ild data', async t => {
	const forgetCacheStub = sinon.stub(cache, 'forget');

	const oldBio = await BioFactory.create({
		user_id: 1
	});
	const response = await request(app).post('/api/bio')
		.set('Cookie', await helpers.authorizedCookie('nur', '123456'))
		.field('description', 'testdesc');

	const bio = await new Bio().fetch();

	t.is(response.status, 200);
	t.is(response.body.description, 'testdesc');
	t.is(response.body.path, oldBio.get('path'));

	t.is(bio.get('user_id'), 1);
	t.is(bio.get('path'), oldBio.get('path'));
	t.is(bio.get('description'), 'testdesc');
	t.true(forgetCacheStub.calledOnce);
	t.true(forgetCacheStub.calledWith('bio:1'));
});


test.serial('It updates bio and deletes old image and deletes old data', async t => {
	const forgetCacheStub = sinon.stub(cache, 'forget');
	const flushStub = sinon.stub();
	const tagCacheStub = sinon.stub(cache, 'tag').returns({
		flush: flushStub
	});

	const oldBio = await BioFactory.create({
		user_id: 1
	});
	const demoFilePath = path.resolve(__dirname, '../../demo.jpg');
	const oldFilePath = path.resolve(__dirname, `../../../public${oldBio.get('path')}`);
	fs.copyFileSync(demoFilePath, oldFilePath);

	const response = await request(app).post('/api/bio')
		.set('Cookie', await helpers.authorizedCookie('nur', '123456'))
		.attach('image', demoFilePath)
		.field('description', 'testdesc');

	const bio = await new Bio().fetch();
	const filePath = path.resolve(__dirname, `../../../public${response.body.path}`);

	t.is(response.status, 200);
	t.is(response.body.description, 'testdesc');
	t.true(fs.existsSync(filePath));
	t.false(fs.existsSync(oldFilePath));

	t.is(bio.get('user_id'), 1);
	t.is(bio.get('path'), response.body.path);
	t.is(bio.get('description'), 'testdesc');
	fs.unlinkSync(filePath);
	t.true(forgetCacheStub.calledOnce);
	t.true(forgetCacheStub.calledWith('bio:1'));

	t.true(tagCacheStub.calledOnce);
	t.true(tagCacheStub.calledWith(['markers', `markers_user:1`]));
	t.true(flushStub.calledOnce);

});


test.serial('It deletes the uploaded image if creation fails', async t => {
	sinon.stub(Bio.prototype, 'save').throws('test');

	const fileCount = fs.readdirSync(path.resolve(__dirname, '../../../public/bios')).length;

	const demoFilePath = path.resolve(__dirname, '../../demo.jpg');

	const response = await request(app).post('/api/bio')
		.set('Cookie', await helpers.authorizedCookie('nur', '123456'))
		.attach('image', demoFilePath)
		.field('description', 'testdesc');

	t.is(response.status, 500);
	t.is(fileCount, fs.readdirSync(path.resolve(__dirname, '../../../public/bios')).length);
});
