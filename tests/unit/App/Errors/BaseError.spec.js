import test from 'ava';
import BaseError from '../../../../App/Errors/BaseError';

test('It creates error object', async t => {
	const error = new BaseError('message', 403, 'name');

	t.is(error.message, 'message');
	t.is(error.statusCode, 403);
	t.is(error.name, 'name');
});