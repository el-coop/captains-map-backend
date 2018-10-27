const router = require('express').Router();
const validation = require('../App/Http/Middleware/ValidationMiddleware');
const AuthController = require('../App/Http/Controllers/AuthController');

router.post('/register', validation.validate({
	username: 'required',
	password: 'min:6',
	email: 'required|email'
}), AuthController.register.bind(AuthController));

router.post('/login', validation.validate({
	username: 'required',
	password: 'required'
}), AuthController.login.bind(AuthController));


module.exports = router;
