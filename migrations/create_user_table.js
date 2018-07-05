let knex = require('./knex');

module.exports = async function createTable() {
	let exists = await knex.schema.hasTable('users');

	if (exists) {
		console.log('dropping old users table');
		await knex.schema.dropTable('users');
	}

	await knex.schema.createTable('users', (table) => {
		table.increments();
		table.string('username');
		table.string('password_digest',1024);
		table.timestamps();
	});
	console.log('created users table');

	return true;
};