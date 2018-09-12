const User = require('../../models/User');

exports.seed = async function (knex, Promise) {
	// Deletes ALL existing entries
	await knex('users').del();

	let user = new User();

	user.username = 'nur';
	user.email = 'nur@elcoop.io';
	user.password = '123456';

	await user.save();

	return true;
};
