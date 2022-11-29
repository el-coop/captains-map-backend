import faker from 'faker';
import Follower from '../../App/models/Follower.js';
import BaseFactory from './BaseFactory.js';

class FollowerFactory extends BaseFactory {
	model() {
		return Follower;
	}

	define() {
		const endpoint = faker.lorem.word();

		return {
			endpoint,
			subscription: {
				endpoint,
			}
		}
	}
}

export default new FollowerFactory();
