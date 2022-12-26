import dotenv from 'dotenv';
dotenv.config();

export default {

	test: {
		dialect: 'sqlite',
		useNullAsDefault: true,
		storage: 'database/test.sqlite3',
		migrations: 'database/migrations',
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
