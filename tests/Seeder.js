import {Sequelize} from "sequelize";
import sequelize, {seedsPath} from "../database/sequelize.js";
import Umzug from 'umzug';

export default new Umzug({
	migrations: {
		path: seedsPath,
		params: [
			sequelize.getQueryInterface(),
			Sequelize
		]
	},
	storage: 'sequelize',
	storageOptions: {
		sequelize: sequelize,
		tableName: 'seeds'
	}
});

