import dotenv from 'dotenv';
import {fileURLToPath} from "url";
import path from "path";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {

	test: {
		dialect: 'sqlite',
		useNullAsDefault: true,
		storage: 'database/test.sqlite3',
		migrations: __dirname + '/database/migrations',
		logging: false,
		seeds: {
			directory: 'database/seeds/test'
		}

	},

	development: {
		dialect: 'mysql',
		host: process.env.DB_HOST,
		username: process.env.DB_USER,
		password: process.env.DB_PASS,
		database: process.env.DB_DATABASE,
		charset: 'utf8mb4',
		logging: false,
		pool: {
			min: 2,
			max: 10
		},
		migrations: 'database/migrations',
		seeds: {
			directory: 'database/seeds'
		}
	},

	production: {
		dialect: 'mysql',
		host: process.env.DB_HOST,
		username: process.env.DB_USER,
		password: process.env.DB_PASS,
		database: process.env.DB_DATABASE,
		charset: 'utf8mb4',
		logging: false,
		pool: {
			min: 2,
			max: 10
		},
		migrations: 'database/migrations',
		seeds: {
			directory: 'database/seeds'
		}
	},

};
