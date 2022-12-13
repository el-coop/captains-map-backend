import Bookshelf from './bookshelf.js';

const Media = Bookshelf.Model.extend({
	tableName: 'medias',
	hasTimestamps: true,

	marker() {
		return this.belongsTo('Marker');
	}

});

export default Bookshelf.model('Media', Media);
