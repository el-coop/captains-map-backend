const Marker = require('../models/Marker');

const pageSize = parseInt(process.env.PAGE_SIZE);

class MarkerRepository {

	async pageMarkers(startId, user) {
		let markers = new Marker();
		if (startId) {
			markers.where('id', '<', startId);
		}
		if (user) {
			markers.where('user_id', user);
		}

		return await this.get(markers, 'DESC', pageSize + 1);
	}

	async getPage(startId = false, user = false) {
		let hasNext = false;
		const markers = await this.pageMarkers(startId, user);

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

	async getObjectPage(object, user) {
		let hasNext = false;
		const data = await this.calculateObjectPage(object, user);
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

	async calculateObjectPage(object, user) {

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

		const prevMarkers = await this.get(markers.where('id', '>', object), 'ASC', numberMarkersBefore - page * pageSize);
		const nextMarkers = await this.get(markers.where('id', '<', object), 'DESC', pageSize - prevMarkers.length);

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

	async get(query, order, limit) {
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