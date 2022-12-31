import {faker} from '@faker-js/faker';
import Story from '../../App/Models/Story.js';
import BaseFactory from './BaseFactory.js';
import UserFactory from "./UserFactory.js";

class StoryFactory extends BaseFactory {
	model() {
		return Story;
	}

	define() {
		return {
			name: faker.lorem.word(),
			user_id: UserFactory
		}
	}
}

export default new StoryFactory();
