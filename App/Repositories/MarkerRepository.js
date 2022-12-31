import Marker from '../Models/Marker.js';
import {Op} from 'sequelize';
import User from "../Models/User.js";
import Bio from "../Models/Bio.js";
import Media from "../Models/Media.js";

const pageSize = parseInt(process.env.PAGE_SIZE);

const buildWhere = Symbol('buildWhere');
const calculateObjectPage = Symbol('calculateObjectPage');
const get = Symbol('get');
const count = Symbol('count');

class MarkerRepository {

	[buildWhere]({user = false, startId = false, borders = false, previous = false}) {
		const where = {};
		if (user) {
			where.user_id = user;
		}
		if (startId) {
			if (previous) {
				where.id = {
					[Op.gt]: startId
				}
			} else {
				where.id = {
					[Op.lt]: startId
				}
			}
		}

		if (borders) {
			where.lat = {
				[Op.gt]: borders[0].lat,
				[Op.lt]: borders[1].lat
			}
			where.lng = {
				[Op.gt]: borders[0].lng,
				[Op.lt]: borders[1].lng
			}
		}

		return where;
	}

	async getPage(conditions = {}) {
		let hasNext = false;
		const where = this[buildWhere](conditions);

		const markers = await this[get](where, 'DESC', pageSize + 1);

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
		const where = this[buildWhere](conditions);

		const markers = await this[get](where, 'ASC', pageSize);

		return {
			markers: markers.sort((a, b) => {
				if (a.id > b.id) {
					return 1;
				}
				return -1;
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

		const searchedMarker = await Marker.findOne({
			attributes: ['id', 'user_id', 'lat', 'lng', 'type', 'location', 'time', 'description'],
			where: {
				id: object,
				user_id: user
			},
			include: [{
				model: User,
				attributes: ['id', 'username'],
				include: {
					model: Bio,
					attributes: ['user_id', 'path'],
					as: 'bio'
				},
				as: 'user'
			}, {
				model: Media,
				attributes: ['id', 'marker_id', 'type', 'path'],
				as: 'media'
			}],
			rejectOnEmpty: true
		});

		const numberMarkersBefore = await Marker.count({
			where: {
				user_id: user,
				id: {
					[Op.gt]: object
				}
			}
		});
		const page = Math.floor(numberMarkersBefore / pageSize);

		const prevMarkers = await this[get]({
			user_id: user,
			id: {[Op.gt]: object}
		}, 'ASC', numberMarkersBefore - page * pageSize);
		const nextMarkers = await this[get]({
			user_id: user,
			id: {[Op.lt]: object}
		}, 'DESC', pageSize - prevMarkers.length);

		nextMarkers.forEach((marker) => {
			prevMarkers.push(marker);
		});

		prevMarkers.push(searchedMarker)

		prevMarkers.sort((a, b) => {
			if (a.id > b.id) {
				return -1;
			}
			return 1;
		});

		return {
			markers: prevMarkers,
			page
		};
	}

	async [get](where, order, limit) {
		where.story_id = null;
		return await Marker.findAll({
			attributes: ['id', 'user_id', 'lat', 'lng', 'type', 'location', 'time', 'description'],
			where,
			include: [{
				model: User,
				attributes: ['id', 'username'],
				include: {
					model: Bio,
					attributes: ['user_id', 'path'],
					as: 'bio',
				},
				as: 'user',
			}, {
				model: Media,
				attributes: ['id', 'marker_id', 'type', 'path'],
				as: 'media',
			}],
			order: [['id', order]],
			limit
		});

	}

	async [count](query, column = '') {
		return await query.count(column);
	}
}

export default new MarkerRepository();
