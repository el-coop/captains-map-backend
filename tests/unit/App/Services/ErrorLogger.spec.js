import test from 'ava';
import http from '../../../../App/Services/HttpService';
import errorLogger from '../../../../App/Services/ErrorLogger';
import sinon from "sinon";


const logUrl = process.env.ERROR_LOGGING_URL;
const key = process.env.ERROR_LOGGING_KEY;

test.beforeEach(() => {
});

test.afterEach.always(() => {
	sinon.restore();
});

test.serial('It logs errors with servertype', async t => {
	const postStub = sinon.stub(http, 'post').returns({
		status: 200
	});

	const error = {
		name: 'name',
		message: 'message',
		stack: 'stack'
	};
	const user = {};

	await errorLogger.log(error, {
		protocol: 'https',
		hostname: 'host',
		path: '/path',
		method: 'get',
		query: 'q',
		body: {
			bla: 'gla'
		},
		params: {
			ram: 'bam'
		}
	});

	t.true(postStub.calledOnce);

	t.true(postStub.firstCall.calledWith(`${logUrl}/${key}`, {
		type: 'serverSide',
		url: 'https://host/path',
		message: error.message,
		exception: {
			name: error.name,
			message: error.message,
			stack: error.stack,
		},
		user,
		extra: {
			request: {
				hostname: 'host',
				method: 'get',
				query: 'q',
				path: '/path',
				body: {
					bla: 'gla'
				},
				params: {
					ram: 'bam'
				},
			}
		}
	}));
});

test.serial('It logs errors from client', async t => {
	const postStub = sinon.stub(http, 'post').returns({
		status: 200
	});

	const error = {
		name: 'name',
		message: 'message',
		stack: 'stack'
	};
	const user = {};

	await errorLogger.clientLog({
		body: {
			url: 'https://host/path',
			error,
			userAgent: 'agent',
			vm: {}
		},
	});

	t.true(postStub.calledOnce);

	t.true(postStub.firstCall.calledWith(`${logUrl}/${key}`, {
		type: 'clientSide',
		url: 'https://host/path',
		message: error.message,
		exception: {
			name: error.name,
			message: error.message,
			stack: error.stack,
		},
		user,
		extra: {
			"Full url": 'https://host/path',
			"User Agent": 'agent',
			vm: {}
		}
	}));
});

