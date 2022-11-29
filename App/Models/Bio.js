import Bookshelf from './bookshelf.js';

import './User.js';

const Bio = Bookshelf.Model.extend({
	tableName: 'bios',
	hasTimestamps: true,
	user() {
		return this.belongsTo('User');
	}
});

export default Bookshelf.model('Bio', Bio);
