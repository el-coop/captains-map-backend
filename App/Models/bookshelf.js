import knex from '../../database/knex.js';
import bookshelfModule from 'bookshelf';

const bookshelf = bookshelfModule(knex);

import bookshelfVirtualsPlugin from 'bookshelf-virtuals-plugin';
bookshelf.plugin(bookshelfVirtualsPlugin);

import bookshelfSecurePassword from 'bookshelf-secure-password';

bookshelf.plugin(bookshelfSecurePassword);

export default bookshelf;
