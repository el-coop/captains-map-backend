const User = require('../../../App/Models/User');

exports.seed = async function (knex, Promise) {
	// Deletes ALL existing entries
	await knex('users').del();

	const user = new User();

	user.set('username','nur');
	user.set('email','nur@elcoop.io');
	user.set('password','123456');

	await user.save();

	return true;
};
