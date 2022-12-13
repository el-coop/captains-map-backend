import test from 'ava';
import DataError from '../../../../App/Errors/DataError.js';

test('It creates error object', async t => {
	const error = new DataError('message', 403, {data: 'test'}, 'name');

	t.is(error.message, 'message');
	t.is(error.statusCode, 403);
	t.is(error.name, 'name');
	t.deepEqual(error.data, {data: 'test'});
});