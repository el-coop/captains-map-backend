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
		markers = await markers.orderBy('id', 'DESC')
			.query((query) => {
				query.limit(pageSize + 1);
			})
			.fetchAll({
				withRelated: [
					'media',
					{
						user(query) {
							return query.select('id', 'username');
						}
					}]
			});

		return markers;
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
}

module.exports = new MarkerRepository();