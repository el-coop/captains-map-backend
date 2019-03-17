const GeocoderService = require('../../Services/GeocoderService');

class GeocoderController {
	async geocode(req, res) {
		const response = await GeocoderService.geocodeCached(req.params.query);

		res.status(200).json(response);
	}

	async reverseGeocode(req, res) {
		const response = await GeocoderService.reverseGeocodeCached(req.params.lat, req.params.lng);

		res.status(200).json(response);
	}
}

module.exports = new GeocoderController();
