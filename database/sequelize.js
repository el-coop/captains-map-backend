const environment = process.env.APP_ENV || 'development';
import dbConfig from '../dbConfig.js';
const config = dbConfig['test'];

import { Sequelize } from 'sequelize';

export default new Sequelize(config.database || '', config.username || '', config.password || '', {
	host: config.host || '',
	dialect: config.dialect || '',
	pool: config.pool || '',
	define: {
		charset: config.charset || '',
		timestamps: true
	},
	storage: config.storage || '',
	logging: config.logging
});

export const migrationsPath = config.migrations;