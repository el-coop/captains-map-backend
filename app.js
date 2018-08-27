const express = require('express');
require('express-async-errors');
const path = require('path');
const cookieParser = require('cookie-parser');
const cookieEncrypter = require('cookie-encrypter');
const logger = require('morgan');
require('dotenv').config();

let app = express();

app.set('port', process.env.PORT || 3000);
app.use('/api/images', express.static('./public/images', {
	immutable: true,
	maxAge: 31536000,
	setHeaders: function (res, path, stat) {
		res.set('Cache-Control', 'public, max-age=31536000')
	}
}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(cookieEncrypter(process.env.COOKIE_SECRET));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', require('./routes/index'));

module.exports = app;
