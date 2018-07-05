const knex = require('../models/bookshelf');
const User = require('../models/User');

module.exports = async function seed() {
	let user = new User();

	user.username = 'nur';
	user.password = '123456';

	await user.save();

	return true;
};