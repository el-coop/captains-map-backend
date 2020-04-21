exports.up = function (knex) {
	return knex.schema.createTable('stories', (table) => {
		table.increments();
		table.integer('user_id').unsigned();
		table.string('name');
		table.timestamps();
		table.foreign('user_id').references('users.id').onDelete('CASCADE');

	});
};
exports.down = function (knex) {
	return knex.schema.dropTable('stories');
};
