'use strict';

const BaseController = require('./base');
const User = require('../models/User');
const Marker = require('../models/Marker');
const Media = require('../models/Media');
const fs = require('fs');
const path = require('path');

class MarkersController extends BaseController {
	async create(req, res) {

		if (!this.validate(req, res)) {
			return;
		}

		try {

			let marker = new Marker();

			//TODO make this for current user
			marker.user_id = 1;
			marker.lat = req.body.lat;
			marker.lng = req.body.lng;
			marker.time = req.body.time;
			marker.description = req.body.description;

			await marker.save();

			let media = new Media();
			media.type = 'image';
			media.path = `/images/${req.file.filename}`;

			await media.$marker.assign(marker);
			await marker.load('media');
			res.status(200);
			res.json(marker);
		} catch (error) {
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
						'markers.media'
					]
				});

				markers = user.$markers;
			} else {
				markers = await new Marker()
					.fetchAll({
						withRelated: [
							'media'
						]
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

	async edit(req, res) {
		const markers = await new Marker({user_id: req.user.id})
			.fetchAll({
				withRelated: [
					'media'
				]
			});

		res.status(200);
		res.json(markers);
	}

	async delete(req, res) {
		try {
			let marker = await new Marker({id: req.params.marker}).fetch({
				withRelated: [
					'media'
				]
			});
			fs.unlinkSync(path.join(__dirname, `../public/${marker.$media.path}`));
			await marker.$media.destroy();
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