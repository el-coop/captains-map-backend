import test from 'ava';
import sinon from 'sinon';
import validationMiddleware from '../../../../App/Http/Middleware/ValidationMiddleware.js';
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.afterEach.always('Restore sinon', t => {
	sinon.restore();
});

test('It registers rules middleware and validation', async t => {

	const result = validationMiddleware.validate();

	t.deepEqual(result, [
		validationMiddleware.rules({}),
		validationMiddleware.verify
	]);
});

test('It validates when rule is in string', async t => {
	const prep = validationMiddleware.validate({
		name: 'required'
	});

	const req = {
		body: {}
	};

	const rules = prep[0][0];
	const validate = prep[1];
	await rules(req, {}, sinon.spy());
	const error = t.throws(() => {
		validate(req, {}, sinon.spy());
	});


	t.is(error.statusCode, 422);
	t.deepEqual(error.data, {
		errors: [{
			location: 'body',
			param: 'name',
			value: '',
			msg: 'Invalid value'
		}]
	});
});

test('It validates when rule is string with |', async t => {
	const prep = validationMiddleware.validate({
		name: 'required|min:6'
	});

	const req = {
		body: {
			name: ''
		}
	};

	const rules = prep[0][0];
	const validate = prep[1];
	await rules(req, {}, sinon.spy());
	const error = t.throws(() => {
		validate(req, {}, sinon.spy());
	});


	t.is(error.statusCode, 422);
	t.deepEqual(error.data, {
		errors: [{
			location: 'body',
			param: 'name',
			value: '',
			msg: 'Invalid value'
		}, {
			location: 'body',
			param: 'name',
			value: '',
			msg: 'Invalid value'
		}]
	});
});


test('It doesnt validate rules for optional input', async t => {
	const prep = validationMiddleware.validate({
		name: 'min:6'
	});

	const req = {
		body: {}
	};
	const res = {
		json: sinon.spy(),
	};
	res.status = sinon.stub().returns(res);

	const next = sinon.spy();

	const rules = prep[0][0];
	const validate = prep[1];
	await rules(req, {}, sinon.spy());
	await validate(req, res, next);

	t.true(res.status.notCalled);
	t.true(res.json.notCalled);
	t.true(next.calledOnce);
});

test('It validates rule in array', async t => {
	const prep = validationMiddleware.validate({
		name: ['in:vest']
	});

	const req = {
		body: {
			name: 'guest'
		}
	};

	const rules = prep[0][0];
	const validate = prep[1];
	await rules(req, {}, sinon.spy());
	const error = t.throws(() => {
		validate(req, {}, sinon.spy());
	});

	t.is(error.statusCode, 422);
	t.deepEqual(error.data, {
		errors: [{
			location: 'body',
			param: 'name',
			value: 'guest',
			msg: 'Invalid value'
		}]
	});
});


test('It validates rules in array', async t => {
	const prep = validationMiddleware.validate({
		name: ['numeric', 'email']
	});

	const req = {
		body: {
			name: 'guest'
		}
	};

	const rules = prep[0][0];
	const validate = prep[1];
	await rules(req, {}, sinon.spy());

	await rules(req, {}, sinon.spy());
	const error = t.throws(() => {
		validate(req, {}, sinon.spy());
	});

	t.is(error.statusCode, 422);
	t.deepEqual(error.data, {
		errors: [{
			location: 'body',
			param: 'name',
			value: 'guest',
			msg: 'Invalid value'
		}, {
			location: 'body',
			param: 'name',
			value: 'guest',
			msg: 'Invalid value'
		}, {
			location: 'body',
			param: 'name',
			value: '@guest',
			msg: 'Invalid value'
		}, {
			location: 'body',
			param: 'name',
			value: '@guest',
			msg: 'Invalid value'
		}]
	});
});


test('It validates date rule', async t => {
	const prep = validationMiddleware.validate({
		name: ['date']
	});

	const req = {
		body: {
			name: 'guest'
		}
	};

	const rules = prep[0][0];
	const validate = prep[1];
	await rules(req, {}, sinon.spy());
	const error = t.throws(() => {
		validate(req, {}, sinon.spy());
	});


	t.is(error.statusCode, 422);
	t.deepEqual(error.data, {
		errors: [{
			location: 'body',
			param: 'name',
			value: null,
			msg: 'Invalid value'
		}]
	});
});

test('It lets proper date pass', async t => {
	const prep = validationMiddleware.validate({
		name: 'date'
	});

	const req = {
		body: {
			name: '2018-10-16T22:32:00.000Z'

		}
	}
	const res = {
		json: sinon.spy(),
	};
	res.status = sinon.stub().returns(res);

	const next = sinon.spy();

	const rules = prep[0][0];
	const validate = prep[1];
	await rules(req, {}, sinon.spy());
	await validate(req, res, next);

	t.true(res.status.notCalled);
	t.true(res.json.notCalled);
	t.true(next.calledOnce);
});

test('It validates regex', async t => {
	const prep = validationMiddleware.validate({
		name: ['matches:asd']
	});

	const req = {
		body: {
			name: 'guest'
		}
	};

	const rules = prep[0][0];
	const validate = prep[1];
	await rules(req, {}, sinon.spy());
	const error = t.throws(() => {
		validate(req, {}, sinon.spy());
	});


	t.is(error.statusCode, 422);
	t.deepEqual(error.data, {
		errors: [{
			location: 'body',
			param: 'name',
			value: 'guest',
			msg: 'Invalid value'
		}]
	});
});

test('It fails validation Object when not object', async t => {
	const prep = validationMiddleware.validate({
		name: ['object']
	});

	const req = {
		body: {
			name: 'guest'
		}
	};

	const rules = prep[0][0];
	const validate = prep[1];
	await rules(req, {}, sinon.spy());

	const error = t.throws(() => {
		validate(req, {}, sinon.spy());
	});


	t.is(error.statusCode, 422);
	t.deepEqual(error.data, {
		errors: [{
			location: 'body',
			param: 'name',
			value: 'guest',
			msg: 'Invalid value'
		}]
	});
});

test('It passes validation Object when object', async t => {
	const prep = validationMiddleware.validate({
		name: ['object']
	});

	const req = {
		body: {
			name: {
				bla: 'gla'
			}
		}
	};

	const rules = prep[0][0];
	const validate = prep[1];
	await rules(req, {}, sinon.spy());

	t.notThrows(() => {
		validate(req, {}, sinon.spy());
	});
});


test('It validates url', async t => {
	const prep = validationMiddleware.validate({
		name: ['url']
	});

	const req = {
		body: {
			name: 'guest'
		}
	};

	const rules = prep[0][0];
	const validate = prep[1];
	await rules(req, {}, sinon.spy());

	const error = t.throws(() => {
		validate(req, {}, sinon.spy());
	});


	t.is(error.statusCode, 422);
	t.deepEqual(error.data, {
		errors: [{
			location: 'body',
			param: 'name',
			value: 'guest',
			msg: 'Invalid value'
		}]
	});
});

test('It validates max', async t => {
	const prep = validationMiddleware.validate({
		name: ['max:3']
	});

	const req = {
		body: {
			name: 'guest'
		}
	};

	const rules = prep[0][0];
	const validate = prep[1];
	await rules(req, {}, sinon.spy());

	const error = t.throws(() => {
		validate(req, {}, sinon.spy());
	});


	t.is(error.statusCode, 422);
	t.deepEqual(error.data, {
		errors: [{
			location: 'body',
			param: 'name',
			value: 'guest',
			msg: 'Invalid value'
		}]
	});
});

test('It validates requiredIf', async t => {
	const prep = validationMiddleware.validate({
		name: ['requiredIf:test,rest']
	});

	const req = {
		body: {
			test: 'rest'
		}
	};

	const rules = prep[0][0];
	const validate = prep[1];
	await rules(req, {}, sinon.spy());

	const error = t.throws(() => {
		validate(req, {}, sinon.spy());
	});


	t.is(error.statusCode, 422);
	t.deepEqual(error.data, {
		errors: [{
			location: 'body',
			param: 'name',
			value: '',
			msg: 'Required if test is rest'
		}]
	});
});


test('It doesnt validate requiredIf when not', async t => {
	const prep = validationMiddleware.validate({
		name: ['requiredIf:test,rest']
	});

	const req = {
		body: {
			test: 'res'
		}
	};

	const rules = prep[0][0];
	const validate = prep[1];
	await rules(req, {}, sinon.spy());

	t.notThrows(() => {
		validate(req, {}, sinon.spy());
	});

});

test('It validates requiredIf when no files on request', async t => {
	const prep = validationMiddleware.validate({
		name: ['requiredIf:test,rest,file']
	});

	const req = {
		body: {
			test: 'rest',
		}
	};

	const rules = prep[0][0];
	const validate = prep[1];
	await rules(req, {}, sinon.spy());

	const error = t.throws(() => {
		validate(req, {}, sinon.spy());
	});

	t.is(error.statusCode, 422);
	t.deepEqual(error.data, {
		errors: [{
			location: 'body',
			param: 'name',
			value: '',
			msg: 'Must upload a file'
		}]
	});
});

test('It validates requiredIf when files are empty, but on request', async t => {
	const prep = validationMiddleware.validate({
		name: ['requiredIf:test,rest,file']
	});

	const req = {
		body: {
			test: 'rest',
		},
		files: []
	};

	const rules = prep[0][0];
	const validate = prep[1];
	await rules(req, {}, sinon.spy());

	const error = t.throws(() => {
		validate(req, {}, sinon.spy());
	});

	t.is(error.statusCode, 422);
	t.deepEqual(error.data, {
		errors: [{
			location: 'body',
			param: 'name',
			value: '',
			msg: 'Must upload a file'
		}]
	});
});

test('It deletes files when validation fails', async t => {
	const prep = validationMiddleware.validate({
		name: ['required']
	});

	const demoFilePath = path.resolve(__dirname, '../../../demo.jpg');
	const filesPath = path.resolve(__dirname, '../../../../public/images/demo.jpg');
	const filePath = path.resolve(__dirname, '../../../../public/images/demo1.jpg');
	fs.copyFileSync(demoFilePath, filesPath);
	fs.copyFileSync(demoFilePath, filePath);


	const req = {
		body: {
		},
		files: [{
			path: filesPath
		}],
		file: {
			path: filePath
		},
	};

	const rules = prep[0][0];
	const validate = prep[1];
	await rules(req, {}, sinon.spy());
	const error = t.throws(() => {
		validate(req, {}, sinon.spy());
	});

	t.is(error.statusCode, 422);
	t.false(fs.existsSync(filesPath));
	t.false(fs.existsSync(filePath));
});
