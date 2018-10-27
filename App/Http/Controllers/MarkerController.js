'use strict';

const Marker = require('../../Models/Marker');
const Media = require('../../Models/Media');
const http = require('../../Services/HttpService');
const BaseError = require('../../Errors/BaseError');
const fs = require('fs');
const path = require('path');
const Cache = require('../../Services/CacheService');
const MarkerRepository = require('../../Repositories/MarkerRepository');

class MarkersController {
	async create(req, res) {
		const marker = new Marker();
		marker.user_id = req.user.id;
		marker.lat = req.body.lat;
		marker.lng = req.body.lng;
		marker.time = req.body.time;
		marker.type = req.body.type;
		marker.description = req.body.description;
		await marker.save();

		const media = new Media();
		const inputMedia = req.body.media;
		media.type = inputMedia.type;
		if (inputMedia.type === 'instagram') {
			const regex = new RegExp(/https:\/\/www\.instagram\.com\/p\/(\w*)\/.*/i);
			media.path = regex.exec(inputMedia.path)[1];
		} else {
			media.path = `/images/${req.file.filename}`;
		}

		await media.$marker.assign(marker);
		await marker.load('media');
		await marker.load('user');

		res.status(200);
		res.json(marker)

	}

	async index(req, res) {
		let borders = false;
		if (req.query.borders) {
			borders = JSON.parse(req.query.borders)
		}
		const markers = await MarkerRepository.getPage({
			startId: req.query.startingId || false,
			borders
		});
		res.status(200);
		res.json(markers);
	}

	async userMarkers(req, res) {
		let borders = false;
		if (req.query.borders) {
			borders = JSON.parse(req.query.borders)
		}

		const user = req.objects.user;

		let markers;
		if (!req.params.markerId) {
			markers = await MarkerRepository.getPage({
				startId: req.query.startingId || false,
				user: user.id,
				borders
			});
		} else {
			try {
				markers = await MarkerRepository.getObjectPage(req.params.markerId, user.id);
			} catch (error) {
				throw new BaseError('Not Found', 404);
			}
		}

		res.status(200);
		res.json(markers);
	}

	async previousMarkers(req, res) {
		let borders = false;
		if (req.query.borders) {
			borders = JSON.parse(req.query.borders)
		}
		const markers = await MarkerRepository.getPreviousPage({
			startId: req.params.markerId,
			user: req.objects.user.id,
			borders
		});
		res.status(200);
		res.json(markers);
	}

	async delete(req, res) {
		try {
			const marker = req.objects.marker;
			await marker.load(['media']);

			try {
				if (marker.$media.type == 'image') {
					fs.unlinkSync(path.join(__dirname, `../../../public/${marker.$media.path}`));
					fs.unlinkSync(path.join(__dirname, `../../../public/${marker.$media.path.replace('images', 'thumbnails')}`));
				}
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
			throw new BaseError('Action failed');
		}
	}

	async getInstagramData(req, res) {
		const instagramId = req.objects.media.path;
		const response = await Cache.remember(`instagram.${instagramId}`, async () => {
			const apiResponse = await http.get(`https://api.instagram.com/oembed?url=http://instagr.am/p/${instagramId}/&omitscript=true&hidecaption=true`);
			if (apiResponse.status === 200) {
				return apiResponse.data;
			}
			throw new BaseError('An error occurred with the Instagram API');
		}, 60 * 60 * 12);
		return res.status(200).set('Cache-Control', 'public, max-age=' + (60 * 60 * 6)).json(
			response
		);
	}
}


module.exports = new MarkersController();