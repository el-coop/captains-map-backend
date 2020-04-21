exports.up = function (knex) {
	return knex.schema.table('markers', function (table) {
		table.integer('story_id').unsigned().nullable().after('user_id');
		table.foreign('story_id').references('stories.id').onDelete('CASCADE');
	});
};

exports.down = function (knex) {
	return knex.schema.table('markers', function(table) {
		table.dropColumn('story_id');
	});
};
