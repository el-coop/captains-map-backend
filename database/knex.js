const environment = process.env.APP_ENV || 'development';
import knexFile from '../knexfile.js';
import knex from 'knex';
const config = knexFile[environment];

export default knex(config);
