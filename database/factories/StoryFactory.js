import {faker} from '@faker-js/faker';
import Story from '../../App/Models/Story.js';
import BaseFactory from './BaseFactory.js';

class StoryFactory extends BaseFactory {
	model() {
		return Story;
	}

	define() {
		return {
			name: faker.lorem.word(),
		}
	}
}

export default new StoryFactory();
