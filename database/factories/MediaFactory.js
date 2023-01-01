import { faker } from '@faker-js/faker';
import Media from '../../App/Models/Media.js';
import BaseFactory from './BaseFactory.js';
import MarkerFactory from "./MarkerFactory.js";

class MediaFactory extends BaseFactory {
	model() {
		return Media;
	}

	define() {
		return {
			marker_id: MarkerFactory,
			type: 'instagram',
			path: 'BlfyEoTDKxi',
		}
	}
}

export default new MediaFactory();