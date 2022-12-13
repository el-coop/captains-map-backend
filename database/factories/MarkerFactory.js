import { faker } from '@faker-js/faker';
import Marker from '../../App/Models/Marker.js';
import BaseFactory from './BaseFactory.js';

class MarkerFactory extends BaseFactory {
	model() {
		return Marker;
	}

	define() {
		return {
			lat: faker.address.latitude(),
			lng: faker.address.longitude(),
			type: 'Visited',
			time: faker.date.recent(),
			description: faker.lorem.sentence()
		}
	}
}

export default new MarkerFactory();