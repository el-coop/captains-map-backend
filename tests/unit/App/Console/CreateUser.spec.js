import test from 'ava';
import knex from '../../../../database/knex';
import sinon from "sinon";

import CreateUser from '../../../../App/Console/Commands/CreateUser';
import User from '../../../../App/Models/User';
import cache from "../../../../App/Services/CacheService";


test.beforeEach(async () => {
	await knex.migrate.latest();
});

test.afterEach.always(async () => {
	await knex.migrate.rollback();
	sinon.restore();
});


test.serial('It creates user from command line', async t => {
	const flushStub = sinon.stub();
	const taggedCacheStub = sinon.stub(cache, 'tag').returns({
		flush: flushStub
	});
	const createUser = new CreateUser();
	await createUser.handle('name','email','123456');

	const userCount = await User.count();
	const user = await new User({
		username: 'name'
	}).fetch();

	t.is(userCount, 1);
	t.is(user.get('username'), 'name');
	t.is(user.get('email'), 'email');
	t.true(taggedCacheStub.calledOnce);
	t.true(taggedCacheStub.calledWith(['user_search']));
	t.true(flushStub.calledOnce);

});
