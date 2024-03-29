import test from 'ava';
import app from '../../app.js';
import request from 'supertest';
import GeocoderService from '../../App/Services/GeocoderService.js';
import sinon from 'sinon';
import helpers from "../Helpers.js";
import migrator from "../Migrator.js";
import seeder from "../Seeder.js";

test.beforeEach(async () => {
	await migrator.up();
	await seeder.up();
});

test.afterEach.always(async () => {
	await migrator.down({to: '20180814134813_create_users_table'});
	await seeder.down({to: 0});
	sinon.restore();
});


test.serial('It rejects unauthorized user', async t => {
	const response = await request(app).get(`/api/geocode/${encodeURIComponent('hayarden 10 haifa')}`);

	t.is(response.status, 403);
	t.deepEqual(response.body, {
		message: "No user.",
		clearToken: true
	});
});

test.serial('It returns geocoder service response', async t => {
	sinon.stub(GeocoderService, 'geocodeCached').callsFake(() => {
		return {
			data: 'data'
		}
	});
	const response = await request(app)
		.get(`/api/geocode/${encodeURIComponent('hayarden 10 haifa')}`)
		.set('Cookie', await helpers.authorizedCookie('nur', '123456'));
	t.deepEqual(response.body, {
		data: 'data'
	});
});


test.serial('It returns reverse geocode service response', async t => {
	sinon.stub(GeocoderService, 'reverseGeocodeCached').callsFake(() => {
		return {
			data: 'data'
		}
	});
	const response = await request(app)
		.get(`/api/geocode/0/0`)
		.set('Cookie', await helpers.authorizedCookie('nur', '123456'));
	t.deepEqual(response.body, {
		data: 'data'
	});
});
