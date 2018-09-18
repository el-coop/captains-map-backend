let express = require('express');
let router = express.Router();
const ThumbnailController = require('../controllers/ThumbnailController');
const errorHandler = require('../middleware/ErrorHandlerMiddleware');
const CSRFMiddleware = require('../middleware/CSRFMiddleware');

if (process.env.APP_ENV !== 'test') {
	CSRFMiddleware(router);
}


router.use('/auth', require('./auth'));
router.use('/marker', require('./marker'));
router.use('/geocode', require('./geocode'));
router.use('/crawler', require('./crawler'));
router.get('/thumbnails/:filename', ThumbnailController.generate);

errorHandler(router);

module.exports = router;