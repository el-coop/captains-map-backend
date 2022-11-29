import Bookshelf from './bookshelf.js';
import jwtService from '../Services/JwtService.js';

import './Marker.js';
import './Bio.js';
import './Follower.js';
import './Story.js';

const User = Bookshelf.Model.extend({
	tableName: 'users',
	hasSecurePassword: true,
	hasTimestamps: true,

	markers() {
		return this.hasMany('Marker');
	},

	stories() {
		return this.hasMany('Story');
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

export default Bookshelf.model('User', User);
