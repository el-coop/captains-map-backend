const Bookshelf = require('./bookshelf');

const Media = Bookshelf.Model.extend({
	tableName: 'medias',
	hasTimestamps: true,

	marker() {
		return this.belongsTo('Marker');
	}

});

module.exports = Bookshelf.model('Media', Media);
