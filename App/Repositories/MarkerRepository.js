const Marker = require('../Models/Marker');
const pageSize = parseInt(process.env.PAGE_SIZE);

const buildConditions = Symbol('buildConditions');
const calculateObjectPage = Symbol('calculateObjectPage');
const get = Symbol('get');

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
			require: true,
			withRelated: [
				'media',
				{
					user(query) {
						return query.select('id', 'username');
					}
				}]
		});

		let markers = new Marker().where('user_id', user);
		const numberMarkersBefore = await markers.where('id', '>', object).count();
		const page = Math.floor(numberMarkersBefore / pageSize);

		const prevMarkers = await this[get](markers.where('id', '>', object), 'ASC', numberMarkersBefore - page * pageSize);
		const nextMarkers = await this[get](markers.where('id', '<', object), 'DESC', pageSize - prevMarkers.length);

		nextMarkers.forEach((marker) => {
			prevMarkers.push(marker);
		});
		markers = prevMarkers.push(searchedMarker).toJSON().sort((a, b) => {
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
			withRelated: [
				'media',
				{
					user(query) {
						return query.select('id', 'username');
					}
				}]
		});
	}
}

module.exports = new MarkerRepository();