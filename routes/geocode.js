const express = require('express');
const router = express.Router();
const authMiddleware = require('../App/Http/Middleware/AuthMiddleware');
const GeocodcerController = require('../App/Http/Controllers/GeocoderController');

router.get('/:query', authMiddleware, GeocodcerController.geocode);
router.get('/:lat/:lng', authMiddleware, GeocodcerController.reverseGeocode);

module.exports = router;
