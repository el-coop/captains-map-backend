import {Sequelize} from "sequelize";
import sequelize, {migrationsPath} from "../database/sequelize.js";
import Umzug from 'umzug';
import sequelizeStorage  from 'umzug/lib/storages/SequelizeStorage.js';

const SequelizeStorage = sequelizeStorage.default;

export default new Umzug({
	migrations: {
		path: migrationsPath,
		params: [
			sequelize.getQueryInterface(),
			Sequelize
		]
	},
	storage: new SequelizeStorage({ sequelize }),
});

