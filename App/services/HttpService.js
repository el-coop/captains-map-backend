const axios = require('axios');

class HttpService {
	async get(url, headers = {}) {
		try {
			return await axios.get(url, headers);
		} catch (error) {
			return error.response;
		}
	}
}

module.exports = new HttpService();