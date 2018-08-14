exports.up = function (knex, Promise) {
	return knex.schema.createTable('markers', (table) => {
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
};

exports.down = function (knex, Promise) {
	return knex.schema.hasTable('markers');
};
