import test from 'ava';
import sinon from 'sinon';
import authMiddleware from '../../../../App/Http/Middleware/AuthMiddleware.js';

test.afterEach.always('Restore sinon', t => {
	sinon.restore();
});
const res = {
	clearCookie(key) {
		return this;
	}
};

test('It return 403 when there is no user', async t => {
	const clearCookieSpy = sinon.spy(res, 'clearCookie');

	const error = t.throws(() => {
		authMiddleware({}, res, {});
	});

	t.is(error.statusCode, 403);
	t.deepEqual(error.data, {
		message: "No user.",
		clearToken: true
	});

	t.true(clearCookieSpy.calledWith('token'));
});

test('It calls next when there is a user', async t => {
	const nextSpy = sinon.spy();
	const req = {
		user: {bla: 'gla'}
	};

	authMiddleware(req, {}, nextSpy);

	t.true(nextSpy.calledOnce);
});
