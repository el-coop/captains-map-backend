let express = require('express');
let router = express.Router();
let csrf = require('csurf');
let csrfProtection = csrf({cookie: true});
const {check} = require('express-validator/check');

let AuthController = require('../controllers/auth');

router.post('/register', [
	check('username').not().isEmpty(),
	check('password').isLength({min: 6}).trim()
], AuthController.register.bind(AuthController));

module.exports = router;
