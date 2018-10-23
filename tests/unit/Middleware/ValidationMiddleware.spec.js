import test from 'ava';
import sinon from 'sinon';
import validationMiddleware from '../../../App/Http/Middleware/ValidationMiddleware';
import { check, validationResult } from 'express-validator/check';

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
	const res = {
		json: sinon.spy(),
	};
	res.status = sinon.stub().returns(res);

	const rules = prep[0][0];
	const validate = prep[1];
	await rules(req, {}, sinon.spy());
	await validate(req, res, sinon.spy());

	t.true(res.status.calledOnce);
	t.true(res.status.calledWith(422));
	t.true(res.json.calledOnce);
	t.true(res.json.calledWith({
		errors: [{
			location: 'body',
			param: 'name',
			value: undefined,
			msg: 'Invalid value'
		}, {
			location: 'body',
			param: 'name',
			value: undefined,
			msg: 'Invalid value'
		}]
	}));
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
	const res = {
		json: sinon.spy(),
	};
	res.status = sinon.stub().returns(res);

	const rules = prep[0][0];
	const validate = prep[1];
	await rules(req, {}, sinon.spy());
	await validate(req, res, sinon.spy());

	t.true(res.status.calledOnce);
	t.true(res.status.calledWith(422));
	t.true(res.json.calledOnce);
	t.true(res.json.calledWith({
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
	}));
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
	const res = {
		json: sinon.spy(),
	};
	res.status = sinon.stub().returns(res);

	const rules = prep[0][0];
	const validate = prep[1];
	await rules(req, {}, sinon.spy());
	await validate(req, res, sinon.spy());

	t.true(res.status.calledOnce);
	t.true(res.status.calledWith(422));
	t.true(res.json.calledOnce);
	t.true(res.json.calledWith({
		errors: [{
			location: 'body',
			param: 'name',
			value: 'guest',
			msg: 'Invalid value'
		}]
	}));
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
	const res = {
		json: sinon.spy(),
	};
	res.status = sinon.stub().returns(res);

	const rules = prep[0][0];
	const validate = prep[1];
	await rules(req, {}, sinon.spy());
	await validate(req, res, sinon.spy());

	t.true(res.status.calledOnce);
	t.true(res.status.calledWith(422));
	t.true(res.json.calledOnce);
	t.true(res.json.calledWith({
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
		}]
	}));
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
	const res = {
		json: sinon.spy(),
	};
	res.status = sinon.stub().returns(res);

	const rules = prep[0][0];
	const validate = prep[1];
	await rules(req, {}, sinon.spy());
	await validate(req, res, sinon.spy());

	t.true(res.status.calledOnce);
	t.true(res.status.calledWith(422));
	t.true(res.json.calledOnce);
	t.true(res.json.calledWith({
		errors: [{
			location: 'body',
			param: 'name',
			value: 'guest',
			msg: 'Invalid value'
		}]
	}));
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
	const res = {
		json: sinon.spy(),
	};
	res.status = sinon.stub().returns(res);

	const rules = prep[0][0];
	const validate = prep[1];
	await rules(req, {}, sinon.spy());
	await validate(req, res, sinon.spy());

	t.true(res.status.calledOnce);
	t.true(res.status.calledWith(422));
	t.true(res.json.calledOnce);
	t.true(res.json.calledWith({
		errors: [{
			location: 'body',
			param: 'name',
			value: 'guest',
			msg: 'Invalid value'
		}]
	}));
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
	const res = {
		json: sinon.spy(),
	};
	res.status = sinon.stub().returns(res);

	const rules = prep[0][0];
	const validate = prep[1];
	await rules(req, {}, sinon.spy());
	await validate(req, res, sinon.spy());

	t.true(res.status.calledOnce);
	t.true(res.status.calledWith(422));
	t.true(res.json.calledOnce);
	t.true(res.json.calledWith({
		errors: [{
			location: 'body',
			param: 'name',
			value: 'guest',
			msg: 'Invalid value'
		}]
	}));
});

test('It validates requiredIf', async t => {
	const prep = validationMiddleware.validate({
		name: ['requiredIf:test,rest']
	});

	const req = {
		body: {
			test: 'rest',
			name: ''
		}
	};
	const res = {
		json: sinon.spy(),
	};
	res.status = sinon.stub().returns(res);

	const rules = prep[0][0];
	const validate = prep[1];
	await rules(req, {}, sinon.spy());
	await validate(req, res, sinon.spy());

	t.true(res.status.calledOnce);
	t.true(res.status.calledWith(422));
	t.true(res.json.calledOnce);
	t.true(res.json.calledWith({
		errors: [{
			location: 'body',
			param: 'name',
			value: '',
			msg: 'Required if test is rest'
		}]
	}));
});