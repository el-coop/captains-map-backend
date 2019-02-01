const Marker = require('../Models/Marker');
const pageSize = parseInt(process.env.PAGE_SIZE);

const buildConditions = Symbol('buildConditions');
const calculateObjectPage = Symbol('calculateObjectPage');
const get = Symbol('get');
const count = Symbol('count');

class MarkerRepository {

	[buildConditions](query, {user = false, startId = false, borders = false, previous = false}) {
		if (user) {
			query.where('user_id', user);
		}
		if (startId) {
			if (previous) {
				query.where('id', '>', startId);
			} else {
				query.where('id', '<', startId);
			}
		}

		if (borders) {
			query.where('lat', '>', borders[0].lat).where('lng', '>', borders[0].lng)
				.where('lat', '<', borders[1].lat).where('lng', '<', borders[1].lng);
		}

		return query;
	}

	async getPage(conditions = {}) {
		let hasNext = false;
		let markers = this[buildConditions](new Marker(), conditions);
		markers = await this[get](markers, 'DESC', pageSize + 1);

		if (markers.length > pageSize) {
			markers.pop();
			hasNext = true;
		}

		return {
			markers,
			pagination: {
				hasNext
			}
		}
	}

	async getPreviousPage(conditions = {}) {
		conditions.previous = true;
		let markers = this[buildConditions](new Marker(), conditions);

		markers = await this[get](markers, 'ASC', pageSize + 1);

		return {
			markers: markers.toJSON().sort((a, b) => {
				if (a.id > b.id) {
					return -1;
				}
				return 1;
			}),
			pagination: {
				hasNext: null,
				page: null
			}
		};
	}

	async getObjectPage(object, user) {
		let hasNext = false;
		const data = await this[calculateObjectPage](object, user);
		const markers = data.markers;
		const page = data.page;

		if (markers.length > pageSize) {
			markers.pop();
			hasNext = true;
		}
		return {
			markers,
			pagination: {
				hasNext,
				page: page
			}
		}
	}

	async [calculateObjectPage](object, user) {

		const searchedMarker = await new Marker({
			id: object,
			user_id: user
		}).fetch({
			columns: ['id', 'user_id', 'lat', 'lng', 'type', 'time', 'description'],
			require: true,
			withRelated: [
				{
					media(query) {
						return query.select('id', 'marker_id', 'type', 'path');
					},
				},

				{
					user(query) {
						return query.select('id', 'username');
					},
				},
				{
					'user.bio'(query) {
						return query.select('user_id', 'path');
					}
				}]
		});

		const numberMarkersBefore = await new Marker().where('user_id', user).where('id', '>', object).count('user_id');
		const page = Math.floor(numberMarkersBefore / pageSize);

		const prevMarkers = await this[get](new Marker().where('user_id', user).where('id', '>', object), 'ASC', numberMarkersBefore - page * pageSize);
		const nextMarkers = await this[get](new Marker().where('user_id', user).where('id', '<', object), 'DESC', pageSize - prevMarkers.length);

		nextMarkers.forEach((marker) => {
			prevMarkers.push(marker);
		});
		const markers = prevMarkers.push(searchedMarker).toJSON().sort((a, b) => {
			if (a.id > b.id) {
				return -1;
			}
			return 1;
		});

		return {
			markers,
			page
		};
	}

	async [get](query, order, limit) {
		return await query.orderBy('id', order).query((qb) => {
			qb.limit(limit);
		}).fetchAll({
			columns: ['id', 'user_id', 'lat', 'lng', 'type', 'time', 'description'],
			withRelated: [
				{
					media(query) {
						return query.select('id','marker_id', 'type', 'path');
					},
				},

				{
					user(query) {
						return query.select('id', 'username');
					},
				},
				{
					'user.bio'(query) {
						return query.select('user_id', 'path');
					}
				}]
		});
	}

	async [count](query, column = '') {
		return await query.count(column);
	}
}

module.exports = new MarkerRepository();
