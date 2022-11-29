import Http from'./HttpService.js';


const endpoint = 'https://nominatim.openstreetmap.org/search';
const reverseEndpoint = 'https://nominatim.openstreetmap.org/reverse';
const formatResults = Symbol('formatResult');

class VirtualEarthGeocoder {
	constructor() {
	}

	async geocode(query, mapBox) {
		const response = await Http.get(`${endpoint}/${query}`, {
			params: {
				viewbox: `${mapBox.west},${mapBox.south},${mapBox.east},${mapBox.north}`,
				addressdetails: 1,
				format: 'json',
				'accept-language': 'en'
			}
		});

		if (response.status > 199 && response.status < 300) {
			return this[formatResults](response.data);
		}

		return [];
	}

	async reverse({lat, lng}) {
		const response = await Http.get(`${reverseEndpoint}`, {
			params: {
				lat,
				lon: lng,
				format: 'json',
				'accept-language': 'en',
				addressdetails: 1,
			}
		});
		if (response.status > 199 && response.status < 300) {
			return this[formatResults](response.data);
		} else {
		}

		return [];
	}

	[formatResults](results) {
		if (!Array.isArray(results)) {
			return [{
				latitude: results.lat,
				longitude: results.lon,
				formattedAddress: results.display_name,
				country: results.address.country,
				city: results.address.city || results.address.town || results.address.village || results.address.hamlet,
				state: results.address.state,
				zipcode: results.address.postcode,
				streetName: results.address.road || results.address.cycleway,
				streetNumber: results.address.house_number,
				countryCode: results.address.countryCode,
				neighbourhood: results.address.neighbourhood || ''
			}]
		}
		const formatted = [];
		results.forEach((result) => {
			formatted.push({
				latitude: result.lat,
				longitude: result.lon,
				formattedAddress: result.display_name,
				country: result.address.country,
				city: result.address.city || result.address.town || result.address.village || result.address.hamlet,
				state: result.address.state,
				zipcode: result.address.postcode,
				streetName: result.address.road || result.address.cycleway,
				streetNumber: result.address.house_number,
				countryCode: result.address.countryCode,
				neighbourhood: result.address.neighbourhood || ''
			});
		});
		return formatted;
	}
}

export default new VirtualEarthGeocoder();
