const Bookshelf = require('./bookshelf');
const Fields = require('bookshelf-schema/lib/fields'),
	IntField = Fields.IntField,
	StringField = Fields.StringField,
	JSONField = Fields.JSONField,
	DateTimeField = Fields.DateTimeField;

const Relations = require('bookshelf-schema/lib/relations'),
	belongsTo = Relations.BelongsTo;

const Follower = Bookshelf.Model.extend({
	tableName: 'followers',
	hasTimestamps: true,
}, {
	schema: [
		IntField('id'),
		IntField('user_id',{
			positive: true
		}),
		StringField('endpoint'),
		JSONField('subscription'),
		DateTimeField('created_at'),
		DateTimeField('updated_at'),

		belongsTo('User')
	]
});

module.exports = Bookshelf.model('Follower', Follower);
