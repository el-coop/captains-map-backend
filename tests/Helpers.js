import request from 'supertest';
import app from '../app.js';

class Helpers {
	async authorizedCookie(username, password) {
		const response = await request(app).post('/api/auth/login')
			.send({
				username: username,
				password: password
			});
		return response.headers['set-cookie'];
	}

	sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
}

export default new Helpers();
