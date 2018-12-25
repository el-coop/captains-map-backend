const faker = require('faker');
const Bio = require('../../App/Models/Bio');
const BaseFactory = require('./BaseFactory');

class BioFactory extends BaseFactory {
	model() {
		return Bio;
	}

	define() {
		return {
			path: '/bios/BlfyEoTDKxi',
			description: faker.lorem.sentence()
		}
	}
};

module.exports = new BioFactory();