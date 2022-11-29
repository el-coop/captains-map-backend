import axios from 'axios';

class HttpService {
	async get(url, headers = {}) {
		try {
			return await axios.get(url, headers);
		} catch (error) {
			return error.response;
		}
	}

	async post(url, data, headers = {}) {
		try {
			return await axios.post(url, data, headers);
		} catch (error) {
			return error.response;
		}
	}
}

export default new HttpService();
