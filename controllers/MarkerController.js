'use strict';

const User = require('../models/User');
const Marker = require('../models/Marker');
const Media = require('../models/Media');
const http = require('../services/HttpService');
const BaseError = require('../errors/BaseError');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const Cache = require('../services/CacheService');

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
		} else if (inputMedia.type === 'camera') {
			const data = req.body['media.camera'].replace(/^data:image\/png;base64,/, "");
			const filePath = `/images/${crypto.randomBytes(16).toString("hex")}${Date.now()}.png`;
			fs.writeFileSync(path.join(__dirname, `../public/${filePath}`), data, 'base64');
			media.path = filePath;
		} else {
			media
				.path = `/images/${req.file.filename}`;
		}

		await
			media.$marker.assign(marker);

		await
			marker.load('media');
		await
			marker.load('user');

		res.status(200);
		res.json(marker)

	}

	async index(req, res) {
		let markers = await
			new Marker()
				.orderBy('created_at', 'ASC').fetchAll({
				withRelated: [
					'media',
					{
						user(query) {
							return query.select('id', 'username');
						}
					}]
			});
		res.status(200);
		res.json(markers);
	}

	async userMarkers(req, res) {
		let user = await
			new User({
				username: req.params.user
			}).fetch({
				withRelated: [
					{
						markers(query) {
							return query.orderBy('created_at', 'ASC');
						},
					},
					'markers.media',
					{
						'markers.user': (query) => {
							return query.select('id', 'username');
						}
					}
				]
			});

		if (!user) {
			throw new BaseError('Not Found', 404);
		}

		res.status(200);
		res.json(user.$markers);
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
			await
				marker.destroy();
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
		const response = await
			Cache.remember(`instagram.${instagramId}`, async () => {
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