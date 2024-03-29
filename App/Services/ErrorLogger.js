import http from './HttpService.js';

const logUrl = process.env.ERROR_LOGGING_URL;
const key = process.env.ERROR_LOGGING_KEY;

const getRequestUser = Symbol('getRequestUser');

class ErrorLogger {

	async clientLog(req, type = 'clientSide') {
		const user = this[getRequestUser](req);
		const error = req.body.error;

		const response = await http.post(`${logUrl}/${key}`, {
			type,
			url: req.body.url.split('?', 1)[0],
			message: error.message,
			exception: {
				name: error.name,
				stack: error.stack,
				message: error.message
			},
			user,
			extra: {
				"Full url": req.body.url,
				"User Agent": req.body.userAgent,
				vm: req.body.vm
			}
		});

		if (response.status && (response.status < 200 || response.status > 299)) {
			console.log(response.data);
		}
	}

	async log(error, req, type = 'serverSide') {
		if( process.env.APP_ENV !== 'production'){
			console.log(error);
		}

		const url = req.protocol + '://' + req.hostname + req.path;
		const user = this[getRequestUser](req);

		const response = await http.post(`${logUrl}/${key}`, {
			type,
			url,
			message: error.message,
			exception: {
				name: error.name,
				message: error.message,
				stack: error.stack,
			},
			user,
			extra: {
				request: {
					hostname: req.hostname,
					method: req.method,
					query: req.query || '',
					path: req.path,
					body: req.body,
					params: req.params,
				}
			}
		});

		if (response && (response.status < 200 || response.status > 299)) {
			console.log(response.data);
		}
	}

	[getRequestUser](req) {
		let user = {};
		if (req.user) {
			user = {
				id: req.user.id,
				username: req.user.username,
				email: req.user.email,
			}
		}

		return user;
	}
}

export default new ErrorLogger;
