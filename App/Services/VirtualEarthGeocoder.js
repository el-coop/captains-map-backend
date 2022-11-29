import Http from './HttpService.js';

const key = process.env.BING_ACCESS_TOKEN;
const endpoint = 'https://dev.virtualearth.net/REST/v1/Locations';
const formatResults = Symbol('formatResult');

class VirtualEarthGeocoder {
	async geocode(query, mapBox) {
		const response = await Http.get(endpoint, {
			params: {
				query,
				key,
				userMapView: `${mapBox.south},${mapBox.west},${mapBox.north},${mapBox.east}`
			}
		});

		if (response.status > 199 && response.status < 300) {
			return this[formatResults](response.data.resourceSets[0]);
		}

		return [];
	}

	async reverse({lat, lng}) {
		const response = await Http.get(`${endpoint}/${lat},${lng}`,{
			params: {
				key,
			}
		});
		if (response.status > 199 && response.status < 300) {
			return this[formatResults](response.data.resourceSets[0]);
		} else {
		}

		return [];
	}

	[formatResults](results) {
		const formatted = [];
		results.resources.forEach((result) => {
			formatted.push({
				'latitude': result.point.coordinates[0],
				'longitude': result.point.coordinates[1],
				'country': result.address.countryRegion,
				'city': result.address.locality,
				'state': result.address.adminDistrict,
				'zipcode': result.address.postalCode,
				'streetName': result.address.addressLine,
				'formattedAddress': result.address.formattedAddress
			});
		});

		return formatted;
	}
}

export default new VirtualEarthGeocoder();
