const express = require('express');
const router = express.Router();
const validation = require('../middleware/ValidationMiddleware');

let AuthController = require('../controllers/AuthController');

router.post('/register', [
	validation.rules({
		username: ['required'],
		password: ['min:6'],
		email: ['required','email']
	}),
	validation.verify
], AuthController.register.bind(AuthController));

router.post('/login', [
	validation.rules({
		username: ['required'],
		password: ['required']
	}),
	validation.verify
], AuthController.login.bind(AuthController));


module.exports = router;
