let Bookshelf = require('./bookshelf');
let Fields = require('bookshelf-schema/lib/fields'),
	StringField = Fields.StringField,
	IntField = Fields.IntField,
	DateTimeField = Fields.DateTimeField;
let Relations = require('bookshelf-schema/lib/relations'),
	belongsTo = Relations.BelongsTo;
require('./Marker');
require('./User');

let Media = Bookshelf.Model.extend({
	tableName: 'medias',
	hasTimestamps: true,
}, {
	schema: [
		IntField('id'),
		IntField('marker_id', {
			positive: true
		}),
		StringField('type'),
		StringField('path'),
		DateTimeField('created_at'),
		DateTimeField('updated_at'),

		belongsTo('Marker'),
		belongsTo('User', {
			through: 'Marker'
		})
	]
});

module.exports = Bookshelf.model('Media', Media);