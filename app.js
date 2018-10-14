const express = require('express');
require('express-async-errors');
const nunjucks = require('nunjucks');
require('dotenv').config();
let app = express();

const kernel = require('./App/Http/Kernel').boot(app);

app.set('port', process.env.PORT || 3000);
nunjucks.configure('views', {
	autoescape: true,
	express: app
});

kernel.registerPreMiddleware();

app.use('/api', require('./routes/index'));

kernel.registerPostMiddleware();

module.exports = app;
