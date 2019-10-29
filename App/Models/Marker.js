let Bookshelf = require('./bookshelf');

require('./User');
require('./Media');

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

module.exports = Bookshelf.model('Marker', Marker);
