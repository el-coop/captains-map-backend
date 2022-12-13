import Bookshelf from './bookshelf.js';

import './User.js';
import './Media.js';

let Marker = Bookshelf.Model.extend({
	tableName: 'markers',
	hasTimestamps: true,

	user() {
		return this.belongsTo('User');
	},

	media() {
		return this.hasMany('Media');
	}
});

export default Bookshelf.model('Marker', Marker);
