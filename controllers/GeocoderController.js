const GeocoderService = require('../services/GeocoderService');

class GeocoderController {
	async geocode(req, res) {
		const response = await GeocoderService.geocodeCached(req.params.query);

		res.status(200).json(response);
	}
}

module.exports = new GeocoderController();