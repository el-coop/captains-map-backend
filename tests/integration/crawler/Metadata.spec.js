import test from 'ava';
import app from '../../../app';
import request from 'supertest';

test.serial('It returns metadata for main page', async t => {

	const response = await request(app).get('/api/crawler');

	console.log(response);
	t.is(response.status, 200);

});
