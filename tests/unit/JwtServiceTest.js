import test from 'ava';
import env from '../loadEnv';
import JwtService from '../../services/JwtService';


test('Generates a valid jwt token', t => {
	t.plan(3);
	const jwt = JwtService.generate({
		data: 'data'
	});

	let data = JSON.parse(new Buffer(jwt.split('.')[1], 'base64').toString('ascii'));

	t.is(data.data, 'data');
	t.truthy(data.hasOwnProperty('exp'));
	t.truthy(data.hasOwnProperty('iat'));
});

test('Verifies verify real token', t => {
	const jwt = JwtService.generate({
		data: 'data'
	});

	t.truthy(JwtService.verify(jwt))
});


test('Fails on a random token', t => {
	t.falsy(JwtService.verify('blabla'))
});