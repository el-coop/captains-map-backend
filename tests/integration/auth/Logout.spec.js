import test from 'ava';
import app from '../../../app.js';
import request from 'supertest';
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


test.serial('Logs out user and deletes cookie', async t => {
	const response = await request(app).get('/api/auth/logout');

	const regex = RegExp(/token=.*Expires=Thu, 01 Jan 1970 00:00:00 GMT/);

	t.true(regex.test(response.headers['set-cookie'][0]));
	t.is(response.status, 200);
	t.is(response.body.status, 'success');
});
