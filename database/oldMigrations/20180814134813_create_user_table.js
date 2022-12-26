export const up = function (knex, Promise) {
	return knex.schema.createTable('users', (table) => {
		table.increments();
		table.string('username');
		table.string('email');
		table.string('password_digest', 1024);
		table.timestamps();

		table.unique('username');
		table.unique('email');
	});
};

export const down = function (knex, Promise) {
	return knex.schema.dropTable('users');
};
