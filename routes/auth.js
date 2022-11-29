import express from 'express';
const router = express.Router();
import validation from '../App/Http/Middleware/ValidationMiddleware.js';
import AuthController from '../App/Http/Controllers/AuthController.js';

router.post('/register', validation.validate({
	username: 'required',
	password: 'min:6',
	email: 'required|email'
}), AuthController.register.bind(AuthController));

router.post('/login', validation.validate({
	username: 'required',
	password: 'required'
}), AuthController.login.bind(AuthController));

router.get('/logout', AuthController.logout);


export default router;
