import { faker } from '@faker-js/faker';
import User from '../../App/Models/User.js';
import BaseFactory from './BaseFactory.js';

class UserFactory extends BaseFactory {
	model() {
		return User;
	}

	define() {
		return {
			username: faker.internet.userName(),
			email: faker.internet.email(),
			password: '123456'
		}
	}
}

export default new UserFactory();