import test from 'ava';
import request from "supertest";
import app from "../../app.js";


test.serial('It returns an empty response with a csrf header', async t => {
	const response = await request(app).get('/api/getCsrf');

	t.is(response.status, 200);
	t.deepEqual(response.body, {});
});
