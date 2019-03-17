exports.up = function (knex, Promise) {
	return knex.schema.createTable('markers', (table) => {
		table.increments();
		table.integer('user_id').unsigned();
		table.foreign('user_id').references('users.id').onDelete('CASCADE');
		table.double('lat');
		table.double('lng');
		table.string('type');
		table.string('location');
		table.dateTime('time');
		table.text('description');
		table.timestamps();

	});
};

exports.down = function (knex, Promise) {
	return knex.schema.dropTable('markers');
};
