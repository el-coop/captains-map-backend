const express = require('express');
const router = express.Router();
const authMiddleware = require('../App/Http/middleware/AuthMiddleware');
const GeocodcerController = require('../App/Http/controllers/GeocoderController');

router.get('/:query', authMiddleware, GeocodcerController.geocode);

module.exports = router;