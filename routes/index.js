let express = require('express');
let router = express.Router();
let csrf = require('csurf');
let csrfProtection = csrf({cookie: true});

let siteController = require('../controllers/site');


// Send CSRF token for session
router.get('/csrf-token', csrfProtection, siteController.csurf);

/* GET home page. */
router.get('/', function (req, res, next) {
	res.send('it works');
});

router.use('/auth', require('./auth'));
router.use('/marker', require('./marker'));

module.exports = router;
