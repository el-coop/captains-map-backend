let Bookshelf = require('./bookshelf');
let Fields = require('bookshelf-schema/lib/fields'),
	StringField = Fields.StringField,
	FloatField = Fields.FloatField,
	IntField = Fields.IntField,
	DateTimeField = Fields.DateTimeField;
let Relations = require('bookshelf-schema/lib/relations'),
	belongsTo = Relations.BelongsTo,
	hasOne = Relations.HasOne;
require('./User');
require('./Media');

let Marker = Bookshelf.Model.extend({
	tableName: 'markers',
	hasTimestamps: true,
}, {
	schema: [
		IntField('id'),
		IntField('user_id', {
			positive: true
		}),
		FloatField('lat'),
		FloatField('lng'),
		StringField('type'),
		StringField('description'),
		DateTimeField('time'),
		DateTimeField('created_at'),
		DateTimeField('updated_at'),

		belongsTo('User'),
		hasOne('Media')
	]
});

module.exports = Bookshelf.model('Marker', Marker);