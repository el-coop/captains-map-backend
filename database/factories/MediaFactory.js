import faker from 'faker';
import Media from '../../App/Models/Media.js';
import BaseFactory from './BaseFactory.js';

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

export default new MediaFactory();