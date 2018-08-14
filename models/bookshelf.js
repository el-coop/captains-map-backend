const knex = require('../database/knex');

let bookshelf = require('bookshelf')(knex);
bookshelf.plugin('visibility');
bookshelf.plugin('virtuals');
bookshelf.plugin('registry');
bookshelf.plugin('processor');

bookshelf.plugin(require('bookshelf-schema')());
bookshelf.plugin(require('bookshelf-secure-password'));

module.exports = bookshelf;