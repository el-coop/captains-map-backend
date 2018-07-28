const axios = require('axios');

class HttpService {
	async get(url, headers = {}) {
		console.log(url);
		try {
			return await axios.get(url, headers);
		} catch (error) {
			console.log(error);
			return error;
		}
	}
}

module.exports = new HttpService();