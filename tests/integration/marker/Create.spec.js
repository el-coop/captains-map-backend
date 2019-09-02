import test from 'ava';
import app from '../../../app';
import knex from '../../../database/knex';
import request from 'supertest';
import helpers from '../../Helpers';
import Marker from '../../../App/Models/Marker';
import Media from '../../../App/Models/Media';
import path from 'path';
import fs from 'fs';
import sinon from "sinon";
import cache from "../../../App/Services/CacheService";


test.beforeEach(async () => {
	await knex.migrate.latest();
	await knex.seed.run();
});

test.afterEach.always(async () => {
	await knex.migrate.rollback();
	sinon.restore();
});

test.serial('It creates a marker with instagram and flushes cache', async t => {
	const flushStub = sinon.stub();
	const taggedCacheStub = sinon.stub(cache, 'tag').returns({
		flush: flushStub
	});

	const response = await request(app).post('/api/marker/create')
		.set('Cookie', await helpers.authorizedCookie('nur', '123456')).send({
			lat: '0',
			lng: '0',
			time: new Date(),
			type: 'Visited',
			description: 'test',
			location: 'test',
			media: {
				type: 'instagram',
				path: 'https://www.instagram.com/p/BlfyEoTDKxi/?utm_source=ig_web_copy_link'
			}
		});

	const marker = await new Marker().fetch({
		withRelated: ['media']
	});

	t.is(response.status, 200);
	t.is(response.body.user_id, 1);
	t.is(response.body.lat, '0');
	t.is(response.body.lng, '0');
	t.is(marker.user_id, 1);
	t.is(marker.lat, 0);
	t.is(marker.lng, 0);
	t.is(marker.location, 'test');
	t.is(marker.$media.at(0).type, 'instagram');
	t.is(marker.$media.at(0).path, 'BlfyEoTDKxi');

	t.true(taggedCacheStub.calledOnce);
	t.true(taggedCacheStub.calledWith(['markers', 'markers_user:1']));
	t.true(flushStub.calledOnce);

});

test.serial('No user gets a forbidden error', async t => {
	const response = await request(app).post('/api/marker/create').send({
		lat: '0',
		lng: '0',
		time: new Date(),
		type: 'Visited',
		description: 'test',
		media: {
			type: 'instagram',
			path: 'https://www.instagram.com/p/BlfyEoTDKxi/?utm_source=ig_web_copy_link'
		}
	});

	t.is(response.status, 403);
	t.deepEqual(response.body, {
		message: "No user.",
		clearToken: true
	});
});

test.serial('It uploads a photos and creates a marker and flushes caches', async t => {
	const flushStub = sinon.stub();
	const taggedCacheStub = sinon.stub(cache, 'tag').returns({
		flush: flushStub
	});
	const response = await request(app).post('/api/marker/create')
		.set('Cookie', await helpers.authorizedCookie('nur', '123456'))
		.attach('media[files]', path.resolve(__dirname, '../../demo.jpg'))
		.attach('media[files]', path.resolve(__dirname, '../../demo.jpg'))
		.field('lat', '0')
		.field('lng', '0')
		.field('time', (new Date()).toISOString())
		.field('type', 'Visited')
		.field('location', 'test')
		.field('description', 'test')
		.field('media[type]', 'file');

	const marker = await new Marker().fetch({
		withRelated: ['media']
	});
	const filePath = path.resolve(__dirname, `../../../public${response.body.media[0].path}`);
	const filePath1 = path.resolve(__dirname, `../../../public${response.body.media[1].path}`);
	t.is(response.status, 200);
	t.is(response.body.user_id, 1);
	t.is(response.body.lat, '0');
	t.is(response.body.lng, '0');
	t.is(marker.user_id, 1);
	t.is(marker.lat, 0);
	t.is(marker.lng, 0);
	t.is(marker.location, 'test');
	t.is(marker.$media.at(0).type, 'file');
	t.is(marker.$media.at(1).type, 'file');
	t.true(fs.existsSync(filePath));
	t.true(fs.existsSync(filePath1));

	fs.unlinkSync(filePath);
	fs.unlinkSync(filePath1);

	t.true(taggedCacheStub.calledOnce);
	t.true(taggedCacheStub.calledWith(['markers', 'markers_user:1']));
	t.true(flushStub.calledOnce);
});

test.serial('It validates data', async t => {
	const response = await request(app).post('/api/marker/create')
		.set('Cookie', await helpers.authorizedCookie('nur', '123456')).send({
			lat: '',
			lng: '',
			time: '',
			type: '',
			description: '',
			media: {
				type: 'image',
				path: ''
			}
		});

	t.is(response.status, 422);
	t.is(response.body.errors[0].param, 'lat');
	t.is(response.body.errors[1].param, 'lat');
	t.is(response.body.errors[2].param, 'lng');
	t.is(response.body.errors[3].param, 'lng');
	t.is(response.body.errors[4].param, 'time');
	t.is(response.body.errors[5].param, 'time');
	t.is(response.body.errors[6].param, 'type');
	t.is(response.body.errors[7].param, 'type');
	t.is(response.body.errors[8].param, 'media.files');

});

test.serial('It deletes created marker and media when error thrown after creation', async t => {

	sinon.stub(Marker.prototype, 'load').throws('test');

	const response = await request(app).post('/api/marker/create')
		.set('Cookie', await helpers.authorizedCookie('nur', '123456')).send({
			lat: '0',
			lng: '0',
			time: new Date(),
			type: 'Visited',
			description: 'test',
			location: 'test',
			media: {
				type: 'instagram',
				path: 'https://www.instagram.com/p/BlfyEoTDKxi/?utm_source=ig_web_copy_link'
			}
		});

	t.is(response.status, 500);
	t.is(0, await Marker.count());
	t.is(0, await Media.count());

});
