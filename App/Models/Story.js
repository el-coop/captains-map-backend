import Bookshelf from './bookshelf.js';
import './Marker.js';
import './User.js';

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

export default Bookshelf.model('Story', Story);
