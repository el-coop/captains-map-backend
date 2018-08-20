import test from 'ava';
import sinon from 'sinon';
import ErrorHandlerRegisterFunction from '../../../middleware/ErrorHandlerMiddleware';
import express from 'express';

const errorHandler = ErrorHandlerRegisterFunction(express.Router());
const res = {
	status(status) {
		return this;
	},
	json(json) {
		return json;
	}
};

test.afterEach.always('Restore sinon', t => {
	sinon.restore();
});

test('It returns a function with 4 arguments', t => {
	t.plan(2);
	t.is(typeof errorHandler, 'function');
	t.is(errorHandler.length, 4);
});

test.serial('It uses existing http status', t => {
	const error = new Error('message');
	const statusSpy = sinon.spy(res, 'status');
	error.statusCode = 403;

	errorHandler(error, {}, res, {});
	t.truthy(statusSpy.calledWith(403));
});

test.serial('It sets status 500 when not supplied', t => {
	const error = new Error('message');
	const statusSpy = sinon.spy(res, 'status');

	errorHandler(error, {}, res, {});
	t.truthy(statusSpy.calledWith(500));
});

test.serial('It sends the error name and message', t => {
	t.plan(2);
	const error = new Error('message');
	const jsonSpy = sinon.spy(res, 'json');

	errorHandler(error, {}, res, {});
	t.is(jsonSpy.returnValues[0].name, error.name);
	t.is(jsonSpy.returnValues[0].message, error.message);
});


test.serial('It includes stack on non production', t => {
	process.env.NODE_ENV = 'development';
	const error = new Error('message');
	const jsonSpy = sinon.spy(res, 'json');
	errorHandler(error, {}, res, {});
	t.true(jsonSpy.returnValues[0].hasOwnProperty('stack'));
});


test.serial('It deletes stack on production', t => {
	process.env.NODE_ENV = 'production';
	const error = new Error('message');
	const jsonSpy = sinon.spy(res, 'json');
	errorHandler(error, {}, res, {});
	t.false(jsonSpy.returnValues[0].hasOwnProperty('stack'));
});

test.serial('It throws the data given in the error', t => {
	process.env.NODE_ENV = 'production';
	const data = {
		test: 'best',
		test1: 'rest'
	};
	const error = new Error('message');
	error.data = data;
	const jsonSpy = sinon.spy(res, 'json');
	errorHandler(error, {}, res, {});
	t.is(jsonSpy.returnValues[0], data);
});