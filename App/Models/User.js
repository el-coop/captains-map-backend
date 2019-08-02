const Bookshelf = require('./bookshelf');
const Fields = require('bookshelf-schema/lib/fields'),
	StringField = Fields.StringField,
	IntField = Fields.IntField,
	DateTimeField = Fields.DateTimeField,
	EmailField = Fields.EmailField;
const jwtService = require('../Services/JwtService');

const Relations = require('bookshelf-schema/lib/relations'),
	HasMany = Relations.HasMany,
	HasOne = Relations.HasOne;

require('./Marker');
require('./Bio');

const User = Bookshelf.Model.extend({
	tableName: 'users',
	hasSecurePassword: true,
	hasTimestamps: true,

	generateJwt() {
		return jwtService.generate({
			id: this.id,
			username: this.username
		});
	}
}, {
	schema: [
		IntField('id'),
		StringField('username'),
		EmailField('email'),
		StringField('password_digest'),
		DateTimeField('created_at'),
		DateTimeField('updated_at'),

		HasMany('Marker', {onDestroy: 'cascade'}),
		HasOne('Bio', {onDestroy: 'cascade'})
	]
});

module.exports = Bookshelf.model('User', User);
