const Geocoder = require('node-geocoder');
const Cache = require('./CacheService');

class GeocoderService {

	constructor() {
		this.geocoders = [
			Geocoder({
				provider: "virtualearth",
				apiKey: process.env.BING_ACCESS_TOKEN
			}),
			Geocoder({
				provider: "openstreetmap",
				language: 'en'
			})
		]

	}

	async geocode(query) {
		return await this.geocoders[Math.floor(Math.random() * this.geocoders.length)].geocode(query);
	}

	async geocodeCached(query) {
		return await Cache.remember(`geocode.${query}`, async () => {
			return await this.geocode(query);
		}, 60 * 60 * 12);
	}
}

module.exports = new GeocoderService();