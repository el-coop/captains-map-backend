const knex = require('../../database/knex');

const bookshelf = require('bookshelf')(knex);
bookshelf.plugin('bookshelf-virtuals-plugin');

bookshelf.plugin(require('bookshelf-secure-password'));

module.exports = bookshelf;
