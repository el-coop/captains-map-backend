import GeocoderService from '../../Services/GeocoderService.js';

class GeocoderController {
	async geocode(req, res) {
		const response = await GeocoderService.geocodeCached(req.params.query, {
			south: req.query.south,
			west: req.query.west,
			north: req.query.north,
			east: req.query.east,
		});

		res.status(200).json(response);
	}

	async reverseGeocode(req, res) {
		const response = await GeocoderService.reverseGeocodeCached(req.params.lat, req.params.lng);

		res.status(200).json(response);
	}
}

export default new GeocoderController();
