import {Sequelize} from "sequelize";
import sequelize, {seedsPath} from "../database/sequelize.js";
import Umzug from 'umzug';
import sequelizeStorage  from 'umzug/lib/storages/SequelizeStorage.js';

const SequelizeStorage = sequelizeStorage.default;

export default new Umzug({
	migrations: {
		path: seedsPath,
		params: [
			sequelize.getQueryInterface(),
			Sequelize
		]
	},
	storage: new SequelizeStorage({ sequelize }),
	storageOptions:{
		tableName: 'seeds'
	}
});

