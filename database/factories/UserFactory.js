const faker = require('faker');
const User = require('../../App/models/User');
const BaseFactory = require('./BaseFactory');

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
};

module.exports = new UserFactory();