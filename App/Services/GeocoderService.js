const VirtualEarthGeocoder = require('./VirtualEarthGeocoder');
const OpenStreetMapGeocoder = require('./OpenStreetMapGeocoder');
const Cache = require('./CacheService');

class GeocoderService {

	constructor() {
		this.geocoders = [
			OpenStreetMapGeocoder,
			VirtualEarthGeocoder,
		]

	}

	async geocode(query, mapBox) {
		return await this.geocoders[Math.floor(Math.random() * this.geocoders.length)].geocode(query, mapBox);
	}

	async reverseGeocode(lat, lng) {
		return await this.geocoders[Math.floor(Math.random() * this.geocoders.length)].reverse({
			lat,
			lng
		});
	}

	async reverseGeocodeCached(lat, lon) {
		return await Cache.remember(`reverseGeocode.${lat}.${lon}`, async () => {
			return await this.reverseGeocode(lat, lon);
		}, 60 * 60 * 12);
	}

	async geocodeCached(query, mapBox) {
		return await Cache.remember(`geocode.${query}.${mapBox}`, async () => {
			return await this.geocode(query, mapBox);
		}, 60 * 60 * 12);
	}
}

module.exports = new GeocoderService();
