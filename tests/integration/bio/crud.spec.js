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

test.beforeEach(async () => {
	await knex.migrate.latest();
	await knex.seed.run();
});

test.afterEach.always('Restore sinon', async () => {
	await knex.migrate.rollback();
	sinon.restore();
});

test('It returns empty when the user has no bio', async t => {
	const response = await request(app).get('/api/bio/nur');

	t.deepEqual(response.body, {});
});

test('It returns 404 for non existent user get', async t => {
	const response = await request(app).get('/api/bio/dio');

	t.is(response.status, 404);
});

test('It returns bio for getting existing user with bio', async t => {
	const bio = await BioFactory.create({
		user_id: 1
	});
	const response = await request(app).get('/api/bio/nur');


	t.deepEqual(response.body, {
		path: bio.path,
		description: bio.description,
	});
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

test('It uploads photo and creates bio when non is present', async t => {
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
});

test('It saves only description when only description is given', async t => {
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
});

test('It updates only description when only description is given', async t => {
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
});


test.only('It updates bio and deletes old iamge', async t => {
	const oldBio = await BioFactory.create({
		user_id: 1
	});
	const demoFilePath = path.resolve(__dirname, '../../demo.jpg');
	const oldFilePath = path.resolve(__dirname, `../../../public${oldBio.path}`);

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
});