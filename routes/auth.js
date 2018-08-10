let express = require('express');
let router = express.Router();
let csrf = require('csurf');
let csrfProtection = csrf({cookie: true});
const validation = require('../middleware/ValidationMiddleware');

let AuthController = require('../controllers/auth');

router.get('/changePassword', AuthController.changePassword);

router.post('/register', [
	validation.rules({
		username: ['required'],
		password: ['min:6']
	}),
	validation.verify
], AuthController.register.bind(AuthController));

router.post('/login', [
	csrfProtection,
	validation.rules({
		username: ['required'],
		password: ['required']
	}),
	validation.verify
], AuthController.login.bind(AuthController));


module.exports = router;
