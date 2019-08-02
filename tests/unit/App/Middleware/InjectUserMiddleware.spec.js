import test from 'ava';
import sinon from 'sinon';
import InjectUserMiddleware from '../../../../App/Http/Middleware/InjectUserMiddleware';
import JwtService from '../../../../App/Services/JwtService';
import knex from "../../../../database/knex";
import User from "../../../../App/Models/User";
import express from "express";

const injectUserMiddleware = new InjectUserMiddleware(express.Router());
const res = {
	clearCookie(key) {
		return this;
	},
	cookie(name, data, settings) {
		return this;
	}
};

test.afterEach.always('Restore sinon', t => {
	sinon.restore();
});

test('it calls next without user when there is no token', async t => {
	const nextSpy = sinon.spy();
	const cookieSpy = sinon.spy(res, 'cookie');
	const req = {
		signedCookies: {}
	};
	await injectUserMiddleware.handle(req, res, nextSpy);

	t.is(req.user, undefined);
	t.false(cookieSpy.called);
	t.true(nextSpy.calledOnce);
});

test.serial('it throws error when cookie exists but the user doesnt verify', async t => {
	await knex.migrate.latest();
	await knex.seed.run();
	const clearCookieSpy = sinon.spy(res, 'clearCookie');
	const cookieSpy = sinon.spy(res, 'cookie');
	sinon.stub(JwtService, 'verify').returns(false);
	const user = await new User().fetch();

	const nextSpy = sinon.spy();
	const req = {
		signedCookies: {
			token: user.generateJwt()
		}
	};

	await injectUserMiddleware.handle(req, res, nextSpy);

	t.is(req.user, undefined);
	t.true(clearCookieSpy.calledWith('token'));
	t.false(cookieSpy.called);
	t.true(nextSpy.calledOnce);
});

test.serial('it injects user when cookie is correct and doesnt refresh cookie', async t => {
	await knex.migrate.latest();
	await knex.seed.run();
	const cookieSpy = sinon.spy(res, 'cookie');

	const user = await new User().fetch();

	const nextSpy = sinon.spy();
	const req = {
		signedCookies: {
			token: user.generateJwt()
		}
	};

	await injectUserMiddleware.handle(req, res, nextSpy);

	t.is(req.user.id, user.id);
	t.false(cookieSpy.called);
	t.true(nextSpy.calledOnce);
});

test.serial('it extends users login duration when under 2 days', async t => {
	await knex.migrate.latest();
	await knex.seed.run();
	const cookieSpy = sinon.spy(res, 'cookie');
	const user = await new User().fetch();

	const nextSpy = sinon.spy();
	const req = {
		signedCookies: {
			token: JwtService.generate({
				id: user.id,
				username: user.username
			}, 172000)
		}
	};

	await injectUserMiddleware.handle(req, res, nextSpy);

	t.true(cookieSpy.called);
	t.true(cookieSpy.calledWith('token'));
	t.is(req.user.id, user.id);
	t.true(nextSpy.calledOnce);
});
