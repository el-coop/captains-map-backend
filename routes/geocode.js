import express from 'express';
const router = express.Router();
import authMiddleware from'../App/Http/Middleware/AuthMiddleware.js';
import GeocodcerController from'../App/Http/Controllers/GeocoderController.js';

router.get('/:query', authMiddleware, GeocodcerController.geocode);
router.get('/:lat/:lng', authMiddleware, GeocodcerController.reverseGeocode);

export default router;
