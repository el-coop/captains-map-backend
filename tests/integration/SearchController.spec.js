import test from 'ava';
import sinon from 'sinon';
import knex from "../../database/knex";
import request from "supertest";
import app from "../../app";
import helpers from "../Helpers";
import UserFactory from "../../database/factories/UserFactory";

test.beforeEach(async () => {
	await knex.migrate.latest();
	await knex.seed.run();
});

test.afterEach.always('Restore sinon', async t => {
	await knex.migrate.rollback();
	sinon.restore();
});

test.serial('It rejects unauthorized user', async t => {
	const response = await request(app).get('/api/search/users/test');

	t.true(response.headers.hasOwnProperty('set-cookie'));
	t.is(response.status, 403);
	t.deepEqual(response.body, {
		message: "No user.",
		clearToken: true
	});
});

test.serial('It returns search with the similar answers', async t => {
	await UserFactory.create({
		username: 'test',
	});
	await UserFactory.create({
		username: 'testa',
	});
	await UserFactory.create({
		username: 'atesta',
	});
	await UserFactory.create({
		username: 'atest',
	});
	const response = await request(app)
		.get('/api/search/users/test')
		.set('Cookie', await helpers.authorizedCookie('nur', '123456'));

	t.deepEqual(response.body, [
		'atest',
		'atesta',
		'test',
		'testa'
	]);
});


test.serial('It doesnt return irrelevant items', async t => {
	await UserFactory.create({
		username: 'test',
	});
	await UserFactory.create({
		username: 'bla',
	});
	await UserFactory.create({
		username: 'gla',
	});
	await UserFactory.create({
		username: 'sla',
	});
	const response = await request(app)
		.get('/api/search/users/test')
		.set('Cookie', await helpers.authorizedCookie('nur', '123456'));

	t.deepEqual(response.body, [
		'test',
	]);
	t.is(response.body.length, 1);
});
