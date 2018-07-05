let knex = require('./knex');

module.exports = async function createTable() {
	let exists = await knex.schema.hasTable('medias');

	if (exists) {
		console.log('dropping old medias table');
		await knex.schema.dropTable('medias');
	}

	await knex.schema.createTable('medias', (table) => {
		table.increments();
		table.integer('marker_id').unsigned();
		table.foreign('marker_id').references('markers.id').onDelete('CASCADE');
		table.string('type');
		table.string('path');
		table.timestamps();

	});
	console.log('created medias table');

	return true;
};