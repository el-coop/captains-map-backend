'use strict';

const BaseController = require('./base');
const Marker = require('../models/Marker');
const Media = require('../models/Media');
const axios = require('axios');
const fs = require('fs');

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
			marker.description = req.body.text;

			await marker.save();

			let media = new Media();
			media.type = 'image';
			media.path = req.file.path;

			await media.$marker.assign(marker);

			res.status(200);
			res.json({
				success: 'true'
			});
		} catch (error) {
			console.log(error);
			res.status(500);
			res.json({
				'error': 'Error'
			});
		}


	}

	readFile(file) {
		return new Promise((resolve, reject) => {
			fs.readFile(file, (error, data) => {
				if (error) {
					return reject(error);
				}
				return resolve(data);
			});
		});
	}
}


module.exports = new MarkersController();