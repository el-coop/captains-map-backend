import test from 'ava';
import axios from 'axios';
import http from '../../../../App/Services/HttpService.js';
import moxios from 'moxios';

test.beforeEach(() => {
	moxios.install(axios);
});

test.afterEach.always(() => {
	moxios.uninstall();
});

test.serial('It returns axios response data when 200 response', async t => {
	moxios.wait(() => {
		let request = moxios.requests.mostRecent();
		request.respondWith({
			status: 200,
			response: {
				message: 'test'
			}
		});
	});

	const response = await http.get('http://test');
	t.is(response.status, 200);
	t.deepEqual(response.data, {
		message: 'test'
	});
});

test.serial('It returns axios error response data when non 200 response', async t => {
	moxios.wait(() => {
		let request = moxios.requests.mostRecent();
		request.respondWith({
			status: 403,
			response: {
				message: 'forbidden'
			}
		});
	});

	const response = await http.get('test');
	t.is(response.status, 403);
	t.deepEqual(response.data, {
		message: 'forbidden'
	});
});


test.serial('It returns axios post response data when 200 response', async t => {
	moxios.wait(() => {
		let request = moxios.requests.mostRecent();
		request.respondWith({
			status: 200,
			response: {
				data: request.config.data
			}
		});
	});

	const response = await http.post('test', 'data');
	t.is(response.status, 200);
	t.deepEqual(response.data, {
		data: 'data'
	});
});

test.serial('It returns axios error post response data when non 200 response', async t => {
	moxios.wait(() => {
		let request = moxios.requests.mostRecent();
		request.respondWith({
			status: 403,
			response: {
				message: 'forbidden'
			}
		});
	});

	const response = await http.post('test');
	t.is(response.status, 403);
	t.deepEqual(response.data, {
		message: 'forbidden'
	});
});

