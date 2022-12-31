import test from 'ava';
import app from '../../app.js';
import request from 'supertest';
import errorLogger from '../../App/Services/ErrorLogger.js';
import sinon from 'sinon';
import migrator from "../Migrator.js";
import seeder from "../Seeder.js";

test.beforeEach(async () => {
	await migrator.up();
	await seeder.up();
});

test.afterEach.always(async () => {
	await migrator.down({to: '20180814134813_create_users_table'});
	await seeder.down({to: 0});
	sinon.restore();
});


test.serial('It logs error', async t => {
	const loggerStub = sinon.stub(errorLogger, 'clientLog');
	const response = await request(app).post(`/api/errors`).field('bla', 0).field('gla', 0);

	t.is(response.status, 200);
	t.true(loggerStub.calledOnce);
});
