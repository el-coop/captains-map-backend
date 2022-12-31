import { faker } from '@faker-js/faker';
import Marker from '../../App/Models/Marker.js';
import BaseFactory from './BaseFactory.js';
import UserFactory from "./UserFactory.js";

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
			description: faker.lorem.sentence(),
			user_id: UserFactory
		}
	}
}

export default new MarkerFactory();