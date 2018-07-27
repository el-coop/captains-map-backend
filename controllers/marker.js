'use strict';

const User = require('../models/User');
const Marker = require('../models/Marker');
const Media = require('../models/Media');
const fs = require('fs');
const path = require('path');

class MarkersController {
	async create(req, res) {
		try {

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
				media.path = inputMedia.path;
				console.log('instagram');
				res.status(200);
				res.json({
					instagram: 'true'
				});
				return;
			} else {
				media.path = `/images/${req.file.filename}`;
			}

			await media.$marker.assign(marker);
			await marker.load('media');
			await marker.load('user');

			res.status(200);
			res.json(marker)
		} catch (error) {
			console.log(error);
			res.status(500);
			res.json({
				error: 'Error'
			});
		}


	}

	async index(req, res) {
		let markers;
		try {
			if (req.params.user) {
				let user = await new User({
					username: req.params.user
				}).fetch({
					withRelated: [
						'markers',
						'markers.media',
						{
							'markers.user': (query) => {
								return query.select('id', 'username');
							}
						}
					]
				});

				markers = user.$markers;
			} else {
				markers = await new Marker()
					.fetchAll({
						withRelated: [
							'media',
							{
								user(query) {
									return query.select('id', 'username');
								}
							}]
					});
			}
			res.status(200);
			res.json(markers);
		} catch (error) {
			res.status(500);
			res.json({
				error: 'Error'
			});
		}
	}

	async delete(req, res) {
		try {
			let marker = await new Marker({id: req.params.marker}).fetch({
				withRelated: [
					'media'
				]
			});

			try {
				fs.unlinkSync(path.join(__dirname, `../public/${marker.$media.path}`));
			} catch (error) {
				console.log(error);
			}
			try {
				if (marker.$media) {
					await marker.$media.destroy();
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
}


module.exports = new MarkersController();