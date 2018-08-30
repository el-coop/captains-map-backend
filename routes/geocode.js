const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/AuthMiddleware');
const GeocodcerController = require('../controllers/GeocoderController');

router.get('/:query', authMiddleware, GeocodcerController.geocode);

module.exports = router;