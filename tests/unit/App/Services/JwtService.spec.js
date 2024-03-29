import test from 'ava';
import JwtService from '../../../../App/Services/JwtService.js';


test('Generates a valid jwt token', t => {
	t.plan(3);
	const jwt = JwtService.generate({
		data: 'data'
	});

	let data = JSON.parse(Buffer.from(jwt.split('.')[1], 'base64').toString('ascii'));

	t.is(data.data, 'data');
	t.true(data.hasOwnProperty('exp'));
	t.true(data.hasOwnProperty('iat'));
});

test('Verifies verify real token', t => {
	const jwt = JwtService.generate({
		data: 'data'
	});

	t.truthy(JwtService.verify(jwt));
});


test('Fails on a random token', t => {
	t.false(JwtService.verify('blabla'))
});