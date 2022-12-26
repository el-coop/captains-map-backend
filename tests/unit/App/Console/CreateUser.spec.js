import test from 'ava';
import sinon from "sinon";
import bcrypt from 'bcrypt';

import CreateUser from '../../../../App/Console/Commands/CreateUser.js';
import User from '../../../../App/Models/User.js';
import cache from "../../../../App/Services/CacheService.js";
import migrator from '../../../Migrator.js';



test.beforeEach(async () => {
	await migrator.up();
});

test.afterEach.always(async () => {
	await migrator.down();
	sinon.restore();
});


test.serial('It creates user from command line', async t => {
	const flushStub = sinon.stub();
	const taggedCacheStub = sinon.stub(cache, 'tag').returns({
		flush: flushStub
	});

	const createUser = new CreateUser();
	await createUser.handle('name', 'email', '123456');

	const userCount = await User.count();
	const user = await User.findOne({
		where: {
			username: 'name'
		}
	});

	t.is(userCount, 1);
	t.is(user.username, 'name');
	t.is(user.email, 'email');
	t.true(await bcrypt.compare('123456',user.password));
	t.true(taggedCacheStub.calledOnce);
	t.true(taggedCacheStub.calledWith(['user_search']));
	t.true(flushStub.calledOnce);

});
