const User = require('../models/User');
const request = require('supertest');
const app = require('../app');

class Helpers {
	async authorizedCookie(username,password) {
		const response = await request(app).post('/api/auth/login')
			.send({
				username: username,
				password: password
			});

		return response.headers['set-cookie'];
	}
}

module.exports = new Helpers();