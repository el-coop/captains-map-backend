import test from 'ava';
import knex from "../../../database/knex";
import app from '../../../app';
import MarkerFactory from "../../../database/factories/MarkerFactory";
import MediaFactory from "../../../database/factories/MediaFactory";
import request from 'supertest';
import UserFactory from "../../../database/factories/UserFactory";
import helpers from "../../Helpers";
import fs from 'fs';
import path from 'path';
import Marker from "../../../App/Models/Marker";


test.beforeEach(async () => {
	await knex.migrate.latest();
	await knex.seed.run();
});

test.afterEach.always(async () => {
	await knex.migrate.rollback();
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
		.set('Cookie', await helpers.authorizedCookie(otherUser.username, '123456'))
		.send();

	t.is(response.status, 403);
});


test('It gives 404 for user trying to non-existing marker', async t => {

	const response = await request(app).delete('/api/marker/100')
		.set('Cookie', await helpers.authorizedCookie('nur', '123456'))
		.send();

	t.is(response.status, 404);
});


test('It allows user to delete marker and deletes image', async t => {
	const marker = await MarkerFactory.create({
		user_id: 1,
	});
	const media = await MediaFactory.create({
		marker_id: marker.id,
		type: 'image',
		path: '/images/blabla'
	});
	const demoFilePath = path.resolve(__dirname, '../../demo.jpg');
	const filePath = path.resolve(__dirname, `../../../public${media.path}`);
	const thumbPath = path.resolve(__dirname, `../../../public/thumbnails/blabla`);
	fs.copyFileSync(demoFilePath, filePath);
	fs.copyFileSync(demoFilePath, thumbPath);


	const response = await request(app).delete(`/api/marker/${marker.id}`)
		.set('Cookie', await helpers.authorizedCookie('nur', '123456'))
		.send();

	t.is(response.status, 200);
	t.false(fs.existsSync(filePath));
	t.false(fs.existsSync(thumbPath));

	const markersCount = await (new Marker).count();

	t.is(markersCount, 0);
});
