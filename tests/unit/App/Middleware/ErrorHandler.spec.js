import test from 'ava';
import sinon from 'sinon';
import ErrorHandlerMiddlware from '../../../../App/Http/Middleware/ErrorHandlerMiddleware';
import express from 'express';
import Multer from 'multer';

const errorHandler = new ErrorHandlerMiddlware(express.Router());
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


test.serial('It uses existing http status', t => {
	const error = new Error('message');
	const statusSpy = sinon.spy(res, 'status');
	error.statusCode = 403;

	errorHandler.handle(error, {}, res, {});
	t.true(statusSpy.calledWith(403));
});

test.serial('It sets status 500 when not supplied', t => {
	const error = new Error('message');
	const statusSpy = sinon.spy(res, 'status');

	errorHandler.handle(error, {}, res, {});
	t.true(statusSpy.calledWith(500));
});

test.serial('It sends the error name and message', t => {
	const error = new Error('message');
	const jsonSpy = sinon.spy(res, 'json');

	errorHandler.handle(error, {}, res, {});
	t.is(jsonSpy.returnValues[0].name, error.name);
	t.is(jsonSpy.returnValues[0].message, error.message);
});

test.serial('It converts multer error for size to 422', t => {
	const error = new Multer.MulterError('LIMIT_FIELD_VALUE');
	const jsonSpy = sinon.spy(res, 'json');
	const statusSpy = sinon.spy(res, 'status');

	errorHandler.handle(error, {}, res, {});

	t.true(statusSpy.calledWith(422));
	t.true(jsonSpy.calledWith({
		errors: [{
			param: 'media.files',
			location: 'body',
			msg: 'Files are too big'
		}]
	}));
});


test.serial('It includes stack on non production', t => {
	process.env.NODE_ENV = 'development';
	const error = new Error('message');
	const jsonSpy = sinon.spy(res, 'json');
	errorHandler.handle(error, {}, res, {});
	t.true(jsonSpy.returnValues[0].hasOwnProperty('stack'));
});


test.serial('It deletes stack on production', t => {
	process.env.NODE_ENV = 'production';
	const error = new Error('message');
	const jsonSpy = sinon.spy(res, 'json');
	errorHandler.handle(error, {}, res, {});
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
	errorHandler.handle(error, {}, res, {});
	t.is(jsonSpy.returnValues[0], data);
});
