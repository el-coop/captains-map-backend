'use strict';

const User = require('../models/User');
const Marker = require('../models/Marker');
const Media = require('../models/Media');
const http = require('../services/HttpService');
const BaseError = require('../errors/BaseError');
const fs = require('fs');
const path = require('path');
const Cache = require('../services/CacheService');
const MarkerRepository = require('../repositories/MarkerRepository');

class MarkersController {
	async create(req, res) {
		let marker = new Marker();
		marker.user_id = req.user.id;
		marker.lat = req.body.lat;
		marker.lng = req.body.lng;
		marker.time = req.body.time;
		marker.type = req.body.type;
		marker.description = req.body.description;
		await marker.save();

		let media = new Media();
		let inputMedia = req.body.media;
		media.type = inputMedia.type;
		if (inputMedia.type === 'instagram') {
			const regex = new RegExp(/https:\/\/www\.instagram\.com\/p\/(\w*)\/.*/i);
			media.path = regex.exec(inputMedia.path)[1];
		}
		else {
			media.path = `/images/${req.file.filename}`;
		}
		await media.$marker.assign(marker);

		await marker.load('media');
		await marker.load('user');

		res.status(200);
		res.json(marker)

	}

	async index(req, res) {
		let markers = await MarkerRepository.getPage(req.query.startingId || false);
		res.status(200);
		res.json(markers);
	}

	async userMarkers(req, res) {
		const user = await new User({
			username: req.params.user
		}).fetch();

		if (!user) {
			throw new BaseError('Not Found', 404);
		}
		let markers;
		if (!req.params.marker) {
			markers = await MarkerRepository.getPage(req.query.startingId || false, user.id);
		} else {
			try {
				markers = await MarkerRepository.getObjectPage(req.params.marker, user.id);
			} catch (error) {
				throw new BaseError('Not Found', 404);
			}
		}

		res.status(200);
		res.json(markers);
	}

	async delete(req, res) {
		try {
			let marker = req.objects.marker;
			await
				marker.load(['media']);

			try {
				fs.unlinkSync(path.join(__dirname, `../public/${marker.$media.path}`));
			} catch (error) {
				console.log(error);
			}
			try {
				if (marker.$media) {
					await
						marker.$media.destroy();
				}
			} catch (error) {
				console.log(error);
			}
			await marker.destroy();
			res.status(200);
			res.json({
				success: true
			});
		} catch (error) {
			console.log(error);
			res.status(500);
			res.json({
				error: 'Error'
			});
		}
	}

	async getInstagramData(req, res) {
		let instagramId = req.objects.media.path;
		const response = await Cache.remember(`instagram.${instagramId}`, async () => {
			let response = await http.get(`https://api.instagram.com/oembed?url=http://instagr.am/p/${instagramId}/&omitscript=true&hidecaption=true`);
			if (response.status === 200) {
				return response.data;
			}
			throw new BaseError('An error occurred with the Instagram API', 500)
		}, 60 * 60 * 12);
		return res.status(200).set('Cache-Control', 'public, max-age=' + (60 * 60 * 6)).json(
			response
		);
	}
}


module.exports = new MarkersController();