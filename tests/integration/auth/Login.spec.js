import test from 'ava';
import app from '../../../app';
import knex from '../../../database/knex';
import sinon from 'sinon';
import JwtService from '../../../App/Services/JwtService';
import request from 'supertest';
import User from "../../../App/Models/User";

test.beforeEach(async () => {
	await knex.migrate.latest();
	await knex.seed.run();
});

test.afterEach.always(async () => {
	await knex.migrate.rollback();
});


test.serial('Return invalid credentials when wrong username', async t => {
	const response = await request(app).post('/api/auth/login')
		.send({
			username: 'bla',
			password: '123456'
		});


	t.false(response.headers.hasOwnProperty('set-cookie'));
	t.is(response.status, 403);
	t.is(response.body.message, 'Invalid Credentials');
});

test.serial('Return invalid credentials when wrong password', async t => {
	const response = await request(app).post('/api/auth/login')
		.send({
			username: 'nur',
			password: '123'
		});

	t.false(response.headers.hasOwnProperty('set-cookie'));
	t.is(response.status, 403);
	t.is(response.body.message, 'Invalid Credentials');
});


test.serial('Requires username and password', async t => {
	const response = await request(app).post('/api/auth/login').send({
		username: '',
		password: ''
	});
	t.false(response.headers.hasOwnProperty('set-cookie'));
	t.is(response.status, 422);
	t.is(response.body.errors[0].param, 'username');
	t.is(response.body.errors[1].param, 'password');
});

test.serial('Generates token and a cookie', async t => {
	const jwtSpy = sinon.spy(JwtService, 'generate');
	const response = await request(app).post('/api/auth/login').send({
		username: 'nur',
		password: '123456'
	});
	let user = await new User().fetch({id: 1});
	t.is(response.status, 200);
	t.true(response.headers.hasOwnProperty('set-cookie'));
	t.true(jwtSpy.calledWith({
		id: user.id,
		username: user.username
	}));
});
