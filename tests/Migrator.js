import {Sequelize} from "sequelize";
import sequelize, {migrationsPath} from "../database/sequelize.js";
import Umzug from 'umzug';

export default new Umzug({
	migrations: {
		path: migrationsPath,
		params: [
			sequelize.getQueryInterface(),
			Sequelize
		]
	},
	storage: 'sequelize',
	storageOptions: {
		sequelize: sequelize,
	}

});

