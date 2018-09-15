import test from 'ava';
import app from '../../../app';
import request from 'supertest';
import knex from "../../../database/knex";

test.beforeEach(async () => {
	await knex.migrate.latest();
	await knex.seed.run();
});

test.afterEach.always(async () => {
	await knex.migrate.rollback();
});

test('It returns metadata for main page', async t => {

	const response = await request(app).get('/api/crawler');

	t.is(response.status, 200);
	t.true(response.text.indexOf('<meta property="og:title" content="Home | Captains Map"/>') > -1);
	t.true(response.text.indexOf('<meta property="og:description" content="Map your life, share it with your friends."/>') > -1);
	t.true(response.text.indexOf('<meta property="og:type" content="website"/>') > -1);
	t.true(response.text.indexOf('<meta property="og:url" content="https://map.elcoop.io"/>') > -1);
	t.true(response.text.indexOf('<meta property="og:image" content="https://map.elcoop.io/api/images/globe-icon.png"/>') > -1);

});

test.serial('It returns metadata for specific user', async t => {

	const response = await request(app).get('/api/crawler/nur');

	t.is(response.status, 200);
	t.true(response.text.indexOf('<meta property="og:title" content="nur | Captains Map"/>') > -1);
	t.true(response.text.indexOf('<meta property="og:description" content="Map your life, share it with your friends."/>') > -1);
	t.true(response.text.indexOf('<meta property="og:type" content="profile"/>') > -1);
	t.true(response.text.indexOf('<meta property="og:url" content="https://map.elcoop.io/nur"/>') > -1);
	t.true(response.text.indexOf('<meta property="og:image" content="https://map.elcoop.io/api/images/globe-icon.png"/>') > -1);

});
