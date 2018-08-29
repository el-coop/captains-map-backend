const http = require('../HttpService');

class MapboxGeocoder {

	constructor(){
		this.url = 'https://api.mapbox.com/geocoding/v5/mapbox.places/';
		this.access_token = process.env.MAPBOX_ACCESS_TOKEN;
	}

	async geocode(query) {
		const response = await http.get(`${this.url}${encodeURIComponent(query)}`);
	}
}