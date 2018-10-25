import test from 'ava';
import sinon from 'sinon';
import modelMiddleware from '../../../../App/Http/Middleware/ModelMiddleware';
import knex from "../../../../database/knex";
import MarkerFactory from "../../../../database/factories/MarkerFactory";

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
	await knex.migrate.latest();
	await knex.seed.run();
});
test.afterEach.always('Restore sinon', async () => {
	await knex.migrate.rollback();
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

	t.is(req.objects.user.username, 'nur');
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
	const marker = await MarkerFactory.create({
		user_id: 2,
	});
	const req = {
		objects: {
			marker
		},
		user: {
			id: 1
		}
	};

	const error = await t.throwsAsync(async () => {
		await modelMiddleware.valdiateOwnership('marker')(req, res, next);
	});
	t.is(error.statusCode, 403);
	t.is(error.message, 'Forbidden');
	t.false(next.called);
});


test.serial('Onwership validation passes when user is the owner', async t => {
	const marker = await MarkerFactory.create({
		user_id: 1,
	});
	const req = {
		objects: {
			marker
		},
		user: {
			id: 1
		}
	};

	await modelMiddleware.valdiateOwnership('marker')(req, res, next);

	t.true(next.called);
});