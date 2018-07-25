let knex = require('./knex');

module.exports = async function createTable() {
	let exists = await knex.schema.hasTable('markers');

	if (exists) {
		console.log('dropping old markers table');
		await knex.schema.dropTable('markers');
	}

	await knex.schema.createTable('markers', (table) => {
		table.increments();
		table.integer('user_id').unsigned();
		table.foreign('user_id').references('users.id').onDelete('CASCADE');
		table.string('lat');
		table.string('lng');
		table.string('type');
		table.dateTime('time');
		table.text('description');
		table.timestamps();

	});
	console.log('created markers table');

	return true;
};