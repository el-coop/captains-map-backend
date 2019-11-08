const Bookshelf = require('./bookshelf');
const jwtService = require('../Services/JwtService');

require('./Marker');
require('./Bio');
require('./Follower');

const User = Bookshelf.Model.extend({
	tableName: 'users',
	hasSecurePassword: true,
	hasTimestamps: true,

	markers() {
		return this.hasMany('Marker');
	},
	followers() {
		return this.hasMany('Follower');
	},
	bio() {
		return this.hasOne('Bio');
	},

	generateJwt() {
		return jwtService.generate({
			id: this.id,
			username: this.username
		});
	}
});

module.exports = Bookshelf.model('User', User);
