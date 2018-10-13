import test from 'ava';
import app from '../../app';
import request from 'supertest';
import GeocoderService from '../../App/services/GeocoderService';
import sinon from 'sinon';
import knex from "../../database/knex";
import helpers from "../Helpers";

test.beforeEach(async () => {
	await knex.migrate.latest();
	await knex.seed.run();
});

test.afterEach.always(async () => {
	await knex.migrate.rollback();
	sinon.restore();
});


test.serial('It rejects unauthorized user', async t => {
	const response = await request(app).get(`/api/geocode/${encodeURIComponent('hayarden 10 haifa')}`);

	t.true(response.headers.hasOwnProperty('set-cookie'));
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
