import {SequelizeStorage, Umzug} from "umzug";
import sequelize, {migrationsPath} from "../database/sequelize.js";
import Sequelize from "sequelize";

export default new Umzug({
	migrations: {
		glob: `${migrationsPath}/*.cjs`,
	},
	context: {queryInterface: sequelize.getQueryInterface(), DataTypes: Sequelize.DataTypes},
	storage: new SequelizeStorage({sequelize}),
	logger: undefined,
});
