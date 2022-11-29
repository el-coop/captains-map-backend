import dotenv from 'dotenv';
dotenv.config();

export default {

	test: {
		client: 'sqlite3',
		useNullAsDefault: true,
		connection: {
			filename: './database/test.sqlite3'
		},
		migrations: {
			directory: new URL('/database/migrations',import.meta.url),
			tableName: 'migrations'
		},
		seeds: {
			directory: new URL('/database/seeds/test',import.meta.url)
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
			directory:  new URL('/database/migrations',import.meta.url),
			tableName: 'migrations'
		},
		seeds: {
			directory:  new URL('/database/seeds',import.meta.url)
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
			directory:  new URL('/database/migrations',import.meta.url),
			tableName: 'migrations'
		},
		seeds: {
			directory:  new URL('/database/seeds',import.meta.url)
		}
	},

};
