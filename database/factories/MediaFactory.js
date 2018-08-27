const faker = require('faker');
const Media = require('../../models/Media');
const BaseFactory = require('./BaseFactory');

class MediaFactory extends BaseFactory {
	model() {
		return Media;
	}

	define() {
		return {
			marker_id: 1,
			type: 'instagram',
			path: 'BlfyEoTDKxi',
		}
	}
};

module.exports = new MediaFactory();