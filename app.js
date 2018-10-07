const express = require('express');
require('express-async-errors');
const path = require('path');
const cookieParser = require('cookie-parser');
const cookieEncrypter = require('cookie-encrypter');
const logger = require('morgan');
const nunjucks = require('nunjucks');
require('dotenv').config();

let app = express();

app.set('port', process.env.PORT || 3000);
nunjucks.configure('views', {
	autoescape: true,
	express: app
});
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(cookieEncrypter(process.env.COOKIE_SECRET));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', require('./routes/index'));

module.exports = app;
