const faker = require('faker');
const Marker = require('../../App/models/Marker');
const BaseFactory = require('./BaseFactory');

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
};

module.exports = new MarkerFactory();