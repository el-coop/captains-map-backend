import test from 'ava';
import sinon from 'sinon';
import InjectUserMiddleware from '../../../../App/Http/Middleware/InjectUserMiddleware.js';
import JwtService from '../../../../App/Services/JwtService.js';
import migrator from '../../../Migrator.js';
import seeder from '../../../Seeder.js';
import User from "../../../../App/Models/User.js";
import express from "express";

const injectUserMiddleware = new InjectUserMiddleware(express.Router());
const res = {
	clearCookie(key) {
		return this;
	},
	cookie(name, data, settings) {
		return this;
	},
	header(name, value) {
		return this;
	}
};

test.beforeEach(async () => {
	await migrator.up();
	await seeder.up();
});

test.afterEach.always(async () => {
	await migrator.down({to: '20180814134813_create_users_table'});
	await seeder.down({to: 0});
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
	const clearCookieSpy = sinon.spy(res, 'clearCookie');
	const cookieSpy = sinon.spy(res, 'cookie');
	sinon.stub(JwtService, 'verify').returns(false);
	const user = await User.findOne();

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
	const cookieSpy = sinon.spy(res, 'cookie');

	const user = await User.findOne();

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
	const cookieSpy = sinon.spy(res, 'cookie');
	const headerSpy = sinon.spy(res, 'header');
	const user = await User.findOne();

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
	t.true(headerSpy.called);
	t.true(headerSpy.calledWith('userextend'));
	t.is(req.user.id, user.id);
	t.true(nextSpy.calledOnce);
});
