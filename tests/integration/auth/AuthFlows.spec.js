import test from 'ava';
import app from '../../../app.js';
import request from 'supertest';
import helpers from "../../Helpers.js";
import migrator from "../../Migrator.js";
import seeder from "../../Seeder.js";

test.beforeEach(async () => {
	await migrator.up();
	await seeder.up();
});

test.afterEach.always(async () => {
	await migrator.down({to: '20180814134813_create_users_table'});
	await seeder.down({to: 0});
});


test.serial('Issues logout when user expired', async t => {

	const originalLoginDuration = process.env.LOGIN_DURATION;

	process.env.LOGIN_DURATION = -10;

	const cookie = await helpers.authorizedCookie('nur', '123456');
	process.env.LOGIN_DURATION = originalLoginDuration;

	const response = await request(app)
		.get(`/api/geocode/${encodeURIComponent('hayarden 10 haifa')}`)
		.set('Cookie', cookie);


	t.is(response.status, 403);
	t.deepEqual(response.body, {
		clearToken: true,
		message: 'No user.',
	});

});
test.serial('Extends cookie when needed', async t => {
	const originalLoginDuration = process.env.LOGIN_DURATION;

	process.env.LOGIN_DURATION = originalLoginDuration * 2 / 3 - 10;
	const cookie = await helpers.authorizedCookie('nur', '123456');

	process.env.LOGIN_DURATION = originalLoginDuration;
	const response = await request(app).get('/api/marker')
		.set('Cookie', cookie);

	t.is(response.status, 200);
	t.true(response.headers.hasOwnProperty('set-cookie'));
	t.true(response.headers.hasOwnProperty('userextend'));

	const regex = RegExp(/token=.*Expires=.*/);
	t.true(regex.test(response.headers['set-cookie'][0]));
});


test.serial('Doesnt extend cookie when not necessary', async t => {
	const cookie = await helpers.authorizedCookie('nur', '123456');

	const response = await request(app).get('/api/marker')
		.set('Cookie', cookie);

	t.is(response.status, 200);
	t.false(response.headers.hasOwnProperty('set-cookie'));
});
