let Bookshelf = require('./bookshelf');
let Fields = require('bookshelf-schema/lib/fields'),
	StringField = Fields.StringField,
	IntField = Fields.IntField,
	DateTimeField = Fields.DateTimeField,
	EmailField = Fields.EmailField;
let jwtService = require('../Services/JwtService');

let Relations = require('bookshelf-schema/lib/relations'),
	HasMany = Relations.HasMany;

require('./Marker');

let User = Bookshelf.Model.extend({
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

		HasMany('Marker', {onDestroy: 'cascade'})
	]
});

module.exports = Bookshelf.model('User', User);