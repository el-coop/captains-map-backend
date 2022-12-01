import faker from 'faker';
import Bio from '../../App/Models/Bio.js';
import BaseFactory from './BaseFactory.js';

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

export default new BioFactory();