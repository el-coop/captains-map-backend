import test from 'ava';
import app from '../../../app';
import request from 'supertest';
import knex from "../../../database/knex";
import MarkerFactory from "../../../database/factories/MarkerFactory";
import MediaFactory from "../../../database/factories/MediaFactory";

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


test.serial('It returns metadata for image marker', async t => {
	const marker = await MarkerFactory.create({
		user_id: 1,
	});
	const medias = [];
	for(let i = 0; i < 3; i++){
		medias.push(await MediaFactory.create({
			type: 'image',
			path: `/path${i}`
		}));
	}

	const response = await request(app).get('/api/crawler/nur/1');
	t.is(response.status, 200);
	t.true(response.text.indexOf('<meta property="og:title" content="nur | Captains Map"/>') > -1);
	t.true(response.text.indexOf('<meta property="og:description" content="' + marker.description + '"/>') > -1);
	t.true(response.text.indexOf('<meta property="og:type" content="article"/>') > -1);
	t.true(response.text.indexOf('<meta property="og:url" content="https://map.elcoop.io/nur/1"/>') > -1);
	medias.forEach((media) => {
		t.true(response.text.indexOf(`<meta property="og:image" content="https://map.elcoop.io/api${media.path}"/>`) > -1);
	});
	t.true(response.text.indexOf(`<meta name="twitter:image" content="https://map.elcoop.io/api${medias[0].path}"/>`) > -1);

});

test.serial('It returns metadata for instagram marker', async t => {
	const marker = await MarkerFactory.create({
		user_id: 1,
	});
	const media = await MediaFactory.create();

	const response = await request(app).get('/api/crawler/nur/1');

	t.is(response.status, 200);
	t.true(response.text.indexOf('<meta property="og:title" content="nur | Captains Map"/>') > -1);
	t.true(response.text.indexOf('<meta property="og:description" content="' + marker.description + '"/>') > -1);
	t.true(response.text.indexOf('<meta property="og:type" content="article"/>') > -1);
	t.true(response.text.indexOf('<meta property="og:url" content="https://map.elcoop.io/nur/1"/>') > -1);
	t.true(response.text.indexOf(`<meta property="og:image" content="https://instagram.com/p/${media.path}/media/"/>`) > -1);
	t.true(response.text.indexOf(`<meta name="twitter:image" content="https://instagram.com/p/${media.path}/media/"/>`) > -1);


});
