export const up = function (knex, Promise) {
	return knex.schema.createTable('medias', (table) => {
		table.increments();
		table.integer('marker_id').unsigned();
		table.foreign('marker_id').references('markers.id').onDelete('CASCADE');
		table.string('type');
		table.string('path');
		table.timestamps();
	});
};

export const down = function (knex, Promise) {
	return knex.schema.dropTable('medias');
};
