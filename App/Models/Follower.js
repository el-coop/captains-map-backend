import Bookshelf from './bookshelf.js';

const Follower = Bookshelf.Model.extend({
	tableName: 'followers',
	hasTimestamps: true,

	parse(attrs) {
		if (attrs['subscription']) {
			attrs['subscription'] = JSON.parse(attrs['subscription']);
		}
		return attrs;
	},

	format(attrs) {
		if (attrs['subscription']) {
			attrs['subscription'] = JSON.stringify(attrs['subscription']);
		}
		return attrs;
	},

	user() {
		return this.belongsTo('User');
	},
});

export default Bookshelf.model('Follower', Follower);
