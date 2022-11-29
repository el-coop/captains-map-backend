'use strict';

import webPush from 'web-push';
import url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

webPush.setVapidDetails(
	'https://map.elcoop.io',
	process.env.VAPID_PUBLIC_KEY,
	process.env.VAPID_PRIVATE_KEY
);

import Marker from '../../Models/Marker.js';
import Follower from '../../Models/Follower.js';
import Media from '../../Models/Media.js';
import http from '../../Services/HttpService.js';
import BaseError from '../../Errors/BaseError.js';
import fs from 'fs';
import path from 'path';
import Cache from '../../Services/CacheService.js';
import MarkerRepository from '../../Repositories/MarkerRepository.js';
import errorLogger from '../../Services/ErrorLogger.js';

const generateQueryKey = Symbol('generateQueryKey');
const notifyFollowers = Symbol('notifyFollowers');

class MarkersController {
	async create(req, res) {
		const marker = new Marker();
		marker.set('user_id', req.user.get('id'));
		marker.set('lat', req.body.lat);
		marker.set('lng', req.body.lng);
		marker.set('time', req.body.time);
		marker.set('type', req.body.type);
		marker.set('description', req.body.description);
		marker.set('location', req.body.location);
		if (req.objects.story) {
			marker.set('story_id', req.objects.story.get('id'));
		}
		await marker.save();

		const medias = [];

		try {
			if (req.body.media.type === 'instagram') {
				const media = new Media();
				const regex = new RegExp(/https:\/\/www\.instagram\.com\/p\/(\w*)\/.*/i);
				media.set('path', regex.exec(req.body.media.path)[1]);
				media.set('type', req.body.media.type);
				media.set('marker_id', marker.get('id'));
				await media.save();

				medias.push(media);
			} else {
				for (let i = 0; i < req.files.length; i++) {
					const file = req.files[i];
					const media = new Media();
					media.set('type', req.body.media.type);
					media.set('path', `/images/${file.filename}`);
					media.set('marker_id', marker.get('id'));
					await media.save();

					medias.push(media);
				}
			}
			await marker.load('media');
			await marker.load('user.bio');

			await Cache.tag(['markers', `markers_user:${req.user.get('id')}`]).flush();

			res.status(200);
			res.json(marker);


			if (!req.objects.story) {
				this[notifyFollowers](req.user, marker, req);
			} else if (await req.objects.story.related('markers').count() === 1) {
				await Cache.tag([`stories_user:${req.user.id}`]).flush();
			}
		} catch (e) {
			await marker.destroy();
			for (let i = 0; i < medias.length; i++) {
				await medias[i].destroy();
			}
			if (req.files) {
				req.files.forEach((file) => {
					fs.unlinkSync(file.path)
				});
			}
			throw e;
		}
	}

	async index(req, res) {
		const queryKey = this[generateQueryKey](req, 'markers');
		let borders = false;
		if (req.query.borders) {
			borders = JSON.parse(req.query.borders);
		}

		const markers = await Cache.tag(['markers']).rememberForever(queryKey, async () => {
			return await MarkerRepository.getPage({
				startId: req.query.startingId || false,
				borders
			});
		});
		res.status(200);
		res.json(markers);
	}

	async userMarkers(req, res) {
		const user = req.objects.user;

		const queryKey = this[generateQueryKey](req, `markers_user:${user.get('id')}`);

		let borders = false;
		if (req.query.borders) {
			borders = JSON.parse(req.query.borders)
		}

		const markers = await Cache.tag([`markers_user:${user.get('id')}`]).rememberForever(queryKey, async () => {
			if (!req.params.markerId) {
				return await MarkerRepository.getPage({
					startId: req.query.startingId || false,
					user: user.get('id'),
					borders
				});
			} else {
				try {
					return await MarkerRepository.getObjectPage(req.params.markerId, user.get('id'));
				} catch (error) {
					throw new BaseError('Not Found', 404);
				}
			}
		});

		res.status(200);
		res.json(markers);
	}

	async previousMarkers(req, res) {
		const user = req.objects.user;
		const queryKey = this[generateQueryKey](req, `markers_prevUser:${user.get('id')}`);

		let borders = false;
		if (req.query.borders) {
			borders = JSON.parse(req.query.borders)
		}

		const markers = await Cache.tag([`markers_user:${user.get('id')}`]).rememberForever(queryKey, async () => {
			return await MarkerRepository.getPreviousPage({
				startId: req.params.markerId,
				user: user.get('id'),
				borders
			});
		});

		res.status(200);
		res.json(markers);
	}

	async delete(req, res) {
		try {
			const marker = req.objects.marker;
			await marker.load(['media']);
			const story = marker.get('story_id');

			try {
				const medias = marker.related('media');
				for (let i = 0; i < medias.length; i++) {
					const media = medias.at(i);
					if (media.get('type') === 'image') {
						fs.unlinkSync(path.join(__dirname, `../../../public/${media.get('path')}`));
						if (fs.existsSync(path.join(__dirname, `../../../public/${media.get('path').replace('images', 'thumbnails')}`))) {
							fs.unlinkSync(path.join(__dirname, `../../../public/${media.get('path').replace('images', 'thumbnails')}`));
						}
					}
					await media.destroy()
				}

			} catch (error) {
				console.log(error);
			}

			await marker.destroy();
			await Cache.tag(['markers', `markers_user:${req.user.get('id')}`]).flush();

			res.status(200);
			res.json({
				success: true
			});

			if (story) {
				await Cache.tag([`stories_user:${req.user.id}`]).flush();
			}
		} catch (error) {
			throw new BaseError('Action failed');
		}
	}

	async getInstagramData(req, res) {
		const instagramId = req.objects.media.get('path');
		const response = await Cache.remember(`instagram:${instagramId}`, async () => {
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

	[generateQueryKey](req, pref) {
		let key = pref;
		if (req.query.borders) {
			key += `_borders:${req.query.borders}`;
		}
		if (req.query.startingId) {
			key += `_starting:${req.query.startingId}`;
		}
		if (req.params.markerId) {
			key += `_marker:${req.params.markerId}`;
		}

		return key;
	}

	async [notifyFollowers](user, marker, req) {
		try {
			const followers = await Cache.rememberForever(`followers_${user.get('id')}`, async () => {
				return await new Follower().where('user_id', user.get('id')).fetchAll({
					columns: ['subscription', 'user_id'],
				});
			});

			const payload = {
				username: user.get('username'),
				image: marker.related('media').at(0).get('path'),

			};

			followers.forEach((follower) => {
				let subscription;
				if (follower.get && typeof follower.get === 'function') {
					subscription = follower.get('subscription');
				} else {
					subscription = follower.subscription;
				}
				webPush.sendNotification(subscription, JSON.stringify(payload));
			});
		} catch (error) {
			await errorLogger.log(error, req);
			console.log(error);
		}

	}
}


export default new MarkersController();
