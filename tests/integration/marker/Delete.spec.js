import test from 'ava';
import app from '../../../app.js';
import MarkerFactory from "../../../database/factories/MarkerFactory.js";
import MediaFactory from "../../../database/factories/MediaFactory.js";
import request from 'supertest';
import UserFactory from "../../../database/factories/UserFactory.js";
import helpers from "../../Helpers.js";
import fs from 'fs';
import path from 'path';
import Marker from "../../../App/Models/Marker.js";
import cache from '../../../App/Services/CacheService.js';
import sinon from "sinon";
import Media from "../../../App/Models/Media.js";
import migrator from "../../Migrator.js";
import seeder from "../../Seeder.js";

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


test.beforeEach(async () => {
	await migrator.up();
	await seeder.up();
});

test.afterEach.always(async () => {
	await migrator.down({to: '20180814134813_create_users_table'});
	await seeder.down({to: 0});
	sinon.restore();
});

test('It prevents guests from deleting users marker', async t => {
	const marker = await MarkerFactory.create({
		user_id: 1,
	});

	const response = await request(app).delete(`/api/marker/${marker.id}`).send();

	t.is(response.status, 403);
});

test('It gives 403 for user trying to delete others marker', async t => {
	const otherUser = await UserFactory.create({
		password: '123456'
	});
	const marker = await MarkerFactory.create({
		user_id: 1,
	});

	const response = await request(app).delete(`/api/marker/${marker.id}`)
		.set('Cookie', await helpers.authorizedCookie(otherUser.get('username'), '123456'))
		.send();

	t.is(response.status, 403);
});


test('It gives 404 for user trying to non-existing marker', async t => {

	const response = await request(app).delete('/api/marker/100')
		.set('Cookie', await helpers.authorizedCookie('nur', '123456'))
		.send();

	t.is(response.status, 404);
});


test.serial('It allows user to delete marker, deletes image and flushes cached data', async t => {
	const flushStub = sinon.stub();
	const taggedCacheStub = sinon.stub(cache, 'tag').returns({
		flush: flushStub
	});

	const marker = await MarkerFactory.create({
		user_id: 1,
	});
	const demoFilePath = path.resolve(__dirname, '../../demo.jpg');
	const medias = [];

	for (let i = 0; i < 3; i++) {
		medias.push(await MediaFactory.create({
			marker_id: marker.id,
			type: 'image',
			path: `/images/blabla${i}`
		}));
		const filePath = path.resolve(__dirname, `../../../public/images/blabla${i}`);
		const thumbPath = path.resolve(__dirname, `../../../public/thumbnails/blabla${i}`);
		fs.copyFileSync(demoFilePath, filePath);
		fs.copyFileSync(demoFilePath, thumbPath);
	}

	const response = await request(app).delete(`/api/marker/${marker.id}`)
		.set('Cookie', await helpers.authorizedCookie('nur', '123456'))
		.send();

	t.is(response.status, 200);
	medias.forEach((media, index) => {
		const filePath = path.resolve(__dirname, `../../../public/images/blabla${index}`);
		const thumbPath = path.resolve(__dirname, `../../../public/thumbnails/blabla${index}`);
		t.false(fs.existsSync(filePath));
		t.false(fs.existsSync(thumbPath));
	});

	t.is(0, await Marker.count());
	t.is(0, await Media.count());

	t.true(taggedCacheStub.calledOnce);
	t.true(taggedCacheStub.calledWith(['markers', 'markers_user:1']));
	t.true(flushStub.calledOnce);
});
