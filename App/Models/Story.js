const Bookshelf = require('./bookshelf');
require('./Marker');
require('./User');

const Story = Bookshelf.Model.extend({
	tableName: 'stories',
	hasTimestamps: true,
	user() {
		return this.belongsTo('User');
	},
	markers() {
		return this.hasMany('Marker');
	},
});

module.exports = Bookshelf.model('Story', Story);
