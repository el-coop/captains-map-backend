import test from 'ava';
import app from '../../app';
import request from 'supertest';
import errorLogger from '../../App/Services/ErrorLogger';
import sinon from 'sinon';
import knex from "../../database/knex";

test.beforeEach(async () => {
	await knex.migrate.latest();
	await knex.seed.run();
});

test.afterEach.always(async () => {
	await knex.migrate.rollback();
	sinon.restore();
});


test.serial('It logs error', async t => {
	const loggerStub = sinon.stub(errorLogger, 'clientLog');
	const response = await request(app).post(`/api/errors`).field('bla', 0).field('gla', 0);

	t.is(response.status, 200);
	t.true(loggerStub.calledOnce);
});
