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
import webpush from "web-push";
import cache from "../../../App/Services/CacheService";
import FollowerFactory from "../../../database/factories/FollowerFactory";
import errorLogger from '../../../App/Services/ErrorLogger';


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
	t.is(response.body.lat, 0);
	t.is(response.body.lng, 0);
	t.is(marker.get('user_id'), 1);
	t.is(marker.get('lat'), 0);
	t.is(marker.get('lng'), 0);
	t.is(marker.get('location'), 'test');
	t.is(marker.related('media').at(0).get('type'), 'instagram');
	t.is(marker.related('media').at(0).get('path'), 'BlfyEoTDKxi');

	t.true(taggedCacheStub.calledOnce);
	t.true(taggedCacheStub.calledWith(['markers', 'markers_user:1']));
	t.true(flushStub.calledOnce);

});

test.serial('It creates a marker and notifies followers', async t => {
	const followers = await FollowerFactory.create({
		user_id: 1,
	}, 2);
	sinon.stub(cache, 'rememberForever').callsArg(1);
	const webpushStub = sinon.stub(webpush, 'sendNotification');
	sinon.stub(cache, 'tag').returns({
		flush: sinon.stub()
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


	const payload = JSON.stringify({
		username: 'nur',
		image: 'BlfyEoTDKxi'
	});


	t.is(response.status, 200);

	await helpers.sleep(5000);

	t.true(webpushStub.calledTwice);
	t.true(webpushStub.calledWith(followers[0].get('subscription'), payload));
	t.true(webpushStub.calledWith(followers[1].get('subscription'), payload));
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
	t.is(response.body.lat, 0);
	t.is(response.body.lng, 0);
	t.is(marker.get('user_id'), 1);
	t.is(marker.get('lat'), 0);
	t.is(marker.get('lng'), 0);
	t.is(marker.get('location'), 'test');
	t.is(marker.related('media').at(0).get('type'), 'file');
	t.is(marker.related('media').at(1).get('type'), 'file');
	t.true(fs.existsSync(filePath));
	t.true(fs.existsSync(filePath1));

	fs.unlinkSync(filePath);
	fs.unlinkSync(filePath1);

	t.true(taggedCacheStub.calledOnce);
	t.true(taggedCacheStub.calledWith(['markers', 'markers_user:1']));
	t.true(flushStub.calledOnce);
});

test.serial('It throws error on more than 5 images', async t => {

	const response = await request(app).post('/api/marker/create')
		.set('Cookie', await helpers.authorizedCookie('nur', '123456'))
		.attach('media[files]', path.resolve(__dirname, '../../demo.jpg'))
		.attach('media[files]', path.resolve(__dirname, '../../demo.jpg'))
		.attach('media[files]', path.resolve(__dirname, '../../demo.jpg'))
		.attach('media[files]', path.resolve(__dirname, '../../demo.jpg'))
		.attach('media[files]', path.resolve(__dirname, '../../demo.jpg'))
		.attach('media[files]', path.resolve(__dirname, '../../demo.jpg'))
		.field('lat', '0')
		.field('lng', '0')
		.field('time', (new Date()).toISOString())
		.field('type', 'Visited')
		.field('location', 'test')
		.field('description', 'test')
		.field('media[type]', 'file');

	t.is(response.status, 500);
	t.is(response.body.name, 'MulterError');

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


test.serial('It creates a marker and logs follower notification error', async t => {
	const error = {
		bla: 'gla'
	};
	const followers = await FollowerFactory.create({
		user_id: 1,
	}, 2);
	sinon.stub(cache, 'rememberForever').callsArg(1);
	const webpushStub = sinon.stub(webpush, 'sendNotification').throws(error);
	const loggerStub = sinon.stub(errorLogger, 'log');
	sinon.stub(cache, 'tag').returns({
		flush: sinon.stub()
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


	const payload = JSON.stringify({
		username: 'nur',
		image: 'BlfyEoTDKxi'
	});


	t.is(response.status, 200);

	await helpers.sleep(5000);

	t.true(webpushStub.calledOnce);
	t.true(webpushStub.calledWith(followers[0].get('subscription'), payload) || webpushStub.calledWith(followers[1].get('subscription'), payload));
	t.true(loggerStub.calledOnce);
	t.true(loggerStub.calledWith(error));
});
