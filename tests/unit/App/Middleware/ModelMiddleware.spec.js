import test from 'ava';
import sinon from 'sinon';
import modelMiddleware from '../../../../App/Http/Middleware/ModelMiddleware.js';
import MarkerFactory from "../../../../database/factories/MarkerFactory.js";
import InjectUserMiddleware from "../../../../App/Http/Middleware/InjectUserMiddleware.js";
import express from "express";
import User from "../../../../App/Models/User.js";
import migrator from "../../../Migrator.js";
import seeder from "../../../Seeder.js";
import UserFactory from "../../../../database/factories/UserFactory.js";

let res;
let next;

test.beforeEach(async () => {
	res = {
		status: sinon.stub().callsFake(() => {
			return res;
		}),
		json: sinon.stub().callsFake(() => {
			return res;
		})
	};
	next = sinon.spy();
	await migrator.up();
	await seeder.up();
});
test.afterEach.always('Restore sinon', async () => {
	await migrator.down({to: '20180814134813_create_users_table'});
	await seeder.down({to: 0});
	sinon.restore();
});

test.serial('It throws 404 when there is no model', async t => {
	const req = {
		params: {
			'marker': 1
		}
	};
	const error = await t.throwsAsync(async () => {
		await modelMiddleware.inject()(req, res, next);
	});
	t.is(error.statusCode, 404);
	t.is(error.message, 'Not Found');

});


test.serial('It injects the model when found', async t => {
	const req = {
		params: {
			'marker': 1
		}
	};
	const marker = await MarkerFactory.create({
		user_id: 1,
	});

	await modelMiddleware.inject()(req, res, next);

	t.is(req.objects.marker.id, marker.id);
	t.true(next.called);
});

test.serial('It injects the model based on different keys', async t => {
	const req = {
		params: {
			'user': 'nur'
		}
	};

	await modelMiddleware.inject({
		User: 'username'
	})(req, res, next);

	t.is(req.objects.user.get('username'), 'nur');
	t.true(next.called);
});

test.serial('Ownership validation returns 403 when no user', async t => {
	const marker = await MarkerFactory.create({
		user_id: 1,
	});
	const req = {
		objects: {
			marker
		}
	};


	const error = await t.throwsAsync(async () => {
		await modelMiddleware.valdiateOwnership('marker')(req, res, next);
	});
	t.is(error.statusCode, 403);
	t.is(error.message, 'Forbidden');
});

test.serial('Ownership validation returns 403 when user doesnt own object', async t => {
	const injectUserMiddleware = new InjectUserMiddleware(express.Router());
	const otherUser = await UserFactory.create();
	const marker = await MarkerFactory.create({
		user_id: otherUser.id,
	});
	const user = await User.findOne();

	const req = {
		objects: {
			marker
		},
		signedCookies: {
			token: user.generateJwt()
		}
	};

	await injectUserMiddleware.handle(req, res, () => {
	});

	const error = await t.throwsAsync(async () => {
		await modelMiddleware.valdiateOwnership('marker')(req, res, next);
	});
	t.is(error.statusCode, 403);
	t.is(error.message, 'Forbidden');
	t.false(next.called);
});


test.serial('Onwership validation passes when user is the owner', async t => {
	const injectUserMiddleware = new InjectUserMiddleware(express.Router());

	const marker = await MarkerFactory.create({
		user_id: 1,
	});
	const user = await User.findOne();

	const req = {
		objects: {
			marker
		},
		signedCookies: {
			token: user.generateJwt()
		}
	};

	await injectUserMiddleware.handle(req, res, ()=>{});

	await modelMiddleware.valdiateOwnership('marker')(req, res, next);

	t.true(next.called);
});
