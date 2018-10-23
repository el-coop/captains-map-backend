import test from 'ava';
import sinon from 'sinon';
import authMiddleware from '../../../App/Http/Middleware/AuthMiddleware';
import knex from "../../../database/knex";
import User from "../../../App/models/User";

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
	const statusSpy = sinon.spy(res, 'status');
	const jsonSpy = sinon.spy(res, 'json');
	const clearCookieSpy = sinon.spy(res, 'clearCookie');

	authMiddleware({signedCookies: {}}, res, () => {
	});

	t.true(statusSpy.calledWith(403));
	t.true(clearCookieSpy.calledWith('token'));
	t.true(jsonSpy.calledWith({
		message: "No user.",
		clearToken: true
	}));
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