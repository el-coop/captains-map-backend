let Bookshelf = require('./bookshelf');
let Fields = require('bookshelf-schema/lib/fields'),
	StringField = Fields.StringField,
	EncryptedStringField = Fields.EncryptedStringField,
	IntField = Fields.IntField,
	DateTimeField = Fields.DateTimeField;

let Relations = require('bookshelf-schema/lib/relations'),
	HasMany = Relations.HasMany;

require('./Marker');

let User = Bookshelf.Model.extend({
	tableName: 'users',
	hasSecurePassword: true,
	hasTimestamps: true,
}, {
	schema: [
		IntField('id'),
		StringField('username'),
		EncryptedStringField('password_digest'),
		DateTimeField('created_at'),
		DateTimeField('updated_at'),

		HasMany('Marker', {onDestroy: 'cascade'})
	]
});

module.exports = Bookshelf.model('User', User);