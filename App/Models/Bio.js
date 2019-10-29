const Bookshelf = require('./bookshelf');

require('./User');

const Bio = Bookshelf.Model.extend({
	tableName: 'bios',
	hasTimestamps: true,
	user() {
		return this.belongsTo('User');
	}
});

module.exports = Bookshelf.model('Bio', Bio);
