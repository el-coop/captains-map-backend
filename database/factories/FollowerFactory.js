const faker = require('faker');
const Follower = require('../../App/models/Follower');
const BaseFactory = require('./BaseFactory');

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
};

module.exports = new FollowerFactory();
