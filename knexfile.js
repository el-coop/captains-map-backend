require('dotenv').config();

module.exports = {

	test: {
		client: 'sqlite3',
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
			charset: 'utf8mb4_bin'
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
			directory: __dirname + '/database/seeds'
		}
	},

	production: {
		client: 'mysql',
		connection: {
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_DATABASE,
			charset: 'utf8mb4_bin'
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
			directory: __dirname + '/database/seeds'
		}
	},

};
