import test from 'ava';
import sinon from 'sinon';
import authMiddleware from '../../../../App/Http/Middleware/AuthMiddleware';
import knex from "../../../../database/knex";
import User from "../../../../App/Models/User";

const res = {
	status(status) {
		return this;
	},
	json(json) {
		return json;
	},
	clearCookie(key) {
		return this;
	}
};

test.afterEach.always('Restore sinon', t => {
	sinon.restore();
});

test('It return 403 when there is no cookie', async t => {
	const clearCookieSpy = sinon.spy(res, 'clearCookie');

	const error = t.throws(() => {
		authMiddleware({signedCookies: {}}, res, {});
	});

	t.is(error.statusCode, 403);
	t.deepEqual(error.data, {
		message: "No user.",
		clearToken: true
	});

	t.true(clearCookieSpy.calledWith('token'));
});

test.serial('It calls next and puts user on request when there is user', async t => {
	await knex.migrate.latest();
	await knex.seed.run();

	const user = await new User().fetch();

	const nextSpy = sinon.spy();
	const req = {
		signedCookies: {
			token: user.generateJwt()
		}
	};

	authMiddleware(req, res, nextSpy);

	t.is(req.user.id, user.id);
	t.true(nextSpy.calledOnce);
});