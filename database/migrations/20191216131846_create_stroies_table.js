exports.up = function (knex) {
	return knex.schema.createTable('stories', (table) => {
		if(process.env.APP_ENV !== 'test'){
			table.engine('InnoDB')
		}
		table.increments();
		table.integer('user_id').unsigned();
		table.string('name');
		table.boolean('published').defaultTo(false);
		table.timestamps();
		table.foreign('user_id').references('users.id').onDelete('CASCADE');

	});
};
exports.down = function (knex) {
	return knex.schema.dropTable('stories');
};
