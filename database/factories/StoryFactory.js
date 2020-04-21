const faker = require('faker');
const Story = require('../../App/Models/Story');
const BaseFactory = require('./BaseFactory');

class MarkerFactory extends BaseFactory {
	model() {
		return Story;
	}

	define() {
		return {
			name: faker.lorem.word(),
		}
	}
};

module.exports = new MarkerFactory();
