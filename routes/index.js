let express = require('express');
let router = express.Router();
const ErrorHandlerMiddleware = require('../middleware/ErrorHandlerMiddleware');
const CSRFMiddleware = require('../middleware/CSRFMiddleware');

if (process.env.APP_ENV !== 'test') {
	new CSRFMiddleware(router);
}

router.use('/', require('./media'));
router.use('/auth', require('./auth'));
router.use('/marker', require('./marker'));
router.use('/geocode', require('./geocode'));
router.use('/crawler', require('./crawler'));

new ErrorHandlerMiddleware(router);

module.exports = router;