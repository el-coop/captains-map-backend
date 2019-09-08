exports.up = function (knex, Promise) {
	return knex.schema.createTable('bios', (table) => {
		table.increments();
		table.integer('user_id').unsigned();
		table.foreign('user_id').references('users.id').onDelete('CASCADE');
		table.string('path');
		table.text('description');
		table.timestamps();

		table.unique('user_id');
	});
};

exports.down = function (knex, Promise) {
	return knex.schema.dropTable('bios');
};
