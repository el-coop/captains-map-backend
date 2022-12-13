import dotenv from 'dotenv';
dotenv.config();
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export default {

	test: {
		client: 'sqlite3',
		useNullAsDefault: true,
		connection: {
			filename: './database/test.sqlite3'
		},
		migrations: {
			directory: __dirname + '/database/migrations',
			tableName: 'migrations'
		},
		seeds: {
			directory: __dirname + '/database/seeds/test'
		}

	},

	development: {
		client: 'mysql',
		connection: {
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_DATABASE,
			charset: 'utf8mb4',
		},
		pool: {
			min: 2,
			max: 10
		},
		migrations: {
			directory: __dirname + '/database/migrations',
			tableName: 'migrations'
		},
		seeds: {
			directory:  __dirname + '/database/seeds'
		}
	},

	production: {
		client: 'mysql',
		connection: {
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_DATABASE,
			charset: 'utf8mb4'
		},
		pool: {
			min: 2,
			max: 10
		},
		migrations: {
			directory:  __dirname + '/database/migrations',
			tableName: 'migrations'
		},
		seeds: {
			directory:  __dirname + '/database/seeds'
		}
	},

};
