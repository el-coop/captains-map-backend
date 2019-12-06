exports.up = function (knex) {
	return knex.schema.createTable('followers', (table) => {
		if(process.env.APP_ENV !== 'test'){
			table.engine('InnoDB');
		}
		table.increments();
		table.integer('user_id').unsigned();
		table.string('endpoint');
		table.json('subscription');
		table.timestamps();

		table.foreign('user_id').references('users.id').onDelete('CASCADE');
		table.unique(['user_id', 'endpoint']);
		table.index('endpoint');
	});
};

exports.down = function (knex) {
	return knex.schema.dropTable('followers');
};
