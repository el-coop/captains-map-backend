const Bookshelf = require('./bookshelf');
const Fields = require('bookshelf-schema/lib/fields'),
	IntField = Fields.IntField,
	DateTimeField = Fields.DateTimeField;
let Relations = require('bookshelf-schema/lib/relations'),
	belongsTo = Relations.BelongsTo;

require('./User');

const Bio = Bookshelf.Model.extend({
	tableName: 'Bios',
	hasTimestamps: true,
}, {
	schema: [
		IntField('id'),
		IntField('user_id', {
			positive: true
		}),
		StringField('path'),
		StringField('description'),
		DateTimeField('created_at'),
		DateTimeField('updated_at'),

		belongsTo('User'),
	]
});

module.exports = Bookshelf.model('Bio', Bio);