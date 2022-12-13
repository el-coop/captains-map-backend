export const up = function (knex) {
	return knex.schema.table('markers', function (table) {
		table.integer('story_id').unsigned().nullable().after('user_id');
		table.foreign('story_id').references('stories.id').onDelete('CASCADE');
	});
};

export const down = function (knex) {
	return knex.schema.table('markers', function(table) {
		if(process.env.APP_ENV !== 'test'){
			table.dropForeign('story_id')
			table.dropColumn('story_id');
		}
	});
};
