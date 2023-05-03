import webPush from 'web-push';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
import Bio from "../../Models/Bio.js";

const generateQueryKey = Symbol('generateQueryKey');
const notifyFollowers = Symbol('notifyFollowers');

class MarkersController {
	async create(req, res) {
		const marker = new Marker();
		marker.user_id = req.user.id;
		marker.lat = parseFloat(req.body.lat);
		marker.lng = parseFloat(req.body.lng);
		marker.time = req.body.time;
		marker.type = req.body.type;
		marker.description = req.body.description;
		marker.location = req.body.location;
		if (req.objects.story) {
			marker.story_id = req.objects.story.id;
		}
		await marker.save();

		const medias = [];

		try {
			if (req.body.media.type === 'instagram') {
				const media = new Media();
				const regex = new RegExp(/https:\/\/www\.instagram\.com\/(p|reel)\/(\w*)\/.*/i);
				media.instagram_type = regex.exec(req.body.media.path)[1];
				media.path = regex.exec(req.body.media.path)[2];
				media.type = req.body.media.type;
				media.marker_id = marker.id;
				await media.save();

				medias.push(media);
			} else {
				for (let i = 0; i < req.files.length; i++) {
					const file = req.files[i];
					const media = new Media();
					media.type = req.body.media.type;
					media.path = `/images/${file.filename}`;
					media.marker_id = marker.id;
					await media.save();

					medias.push(media);
				}
			}
			marker.setDataValue('media', medias);
			marker.setDataValue('user',
				await marker.getUser({
					attributes: ['id', 'username'],
					include: [{
						attributes: ['user_id', 'path'],
						model: Bio,
						as: 'bio'
					}]
				})
			);

			await Cache.tag(['markers', `markers_user:${req.user.id}`]).flush();

			res.status(200);
			res.json(marker);

			if (!req.objects.story) {
				this[notifyFollowers](req.user, marker, req);
			} else if (await req.objects.story.countMarkers() === 1) {
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

		const queryKey = this[generateQueryKey](req, `markers_user:${user.id}`);

		let borders = false;
		if (req.query.borders) {
			borders = JSON.parse(req.query.borders)
		}

		const markers = await Cache.tag([`markers_user:${user.id}`]).rememberForever(queryKey, async () => {
			if (!req.params.markerId) {
				return await MarkerRepository.getPage({
					startId: req.query.startingId || false,
					user: user.id,
					borders
				});
			} else {
				try {
					return await MarkerRepository.getObjectPage(req.params.markerId, user.id);
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
		const queryKey = this[generateQueryKey](req, `markers_prevUser:${user.id}`);

		let borders = false;
		if (req.query.borders) {
			borders = JSON.parse(req.query.borders)
		}

		const markers = await Cache.tag([`markers_user:${user.id}`]).rememberForever(queryKey, async () => {
			return await MarkerRepository.getPreviousPage({
				startId: req.params.markerId,
				user: user.id,
				borders
			});
		});

		res.status(200);
		res.json(markers);
	}

	async delete(req, res) {
		try {
			const marker = req.objects.marker;
			const medias = await marker.getMedia();
			const story = marker.story_id;

			try {
				for (let i = 0; i < medias.length; i++) {
					const media = medias.at(i);
					if (media.type === 'image') {
						fs.unlinkSync(path.join(__dirname, `../../../public/${media.path}`));
						if (fs.existsSync(path.join(__dirname, `../../../public/${media.path.replace('images', 'thumbnails')}`))) {
							fs.unlinkSync(path.join(__dirname, `../../../public/${media.path.replace('images', 'thumbnails')}`));
						}
					}
					await media.destroy()
				}

			} catch (error) {
				console.log(error);
			}

			await marker.destroy();
			await Cache.tag(['markers', `markers_user:${req.user.id}`]).flush();

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
		const instagramId = req.params.media;
		const instagramType = req.params.type;
		const image = await Cache.remember(`instagram:${instagramId}`, async () => {
			const apiResponse = await http.get(`https://www.instagram.com/${instagramType}/${instagramId}/embed/`);
			if(apiResponse.status !== 200){
				throw new BaseError('An error occurred with the Instagram API');
			}
			const imageLink = apiResponse.data.split('"EmbeddedMediaImage"')[1].split('src="')[1].split('"')[0].replaceAll('&amp;','&');
			const image = await http.get(imageLink,{
				responseType: 'arraybuffer'
			});
			if (image.status === 200) {
				return image;
			}
			throw new BaseError('An error occurred with the Instagram API');
		}, 60 * 60 * 12);
		return res.status(200)
			.header('content-type',image.headers['content-type'])
			.set('Cache-Control', 'public, max-age=' + (60 * 60 * 12))
			.send(image.data);
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
			const followers = await Cache.rememberForever(`followers_${user.id}`, async () => {
				return await Follower.findAll({
					attributes: ['subscription', 'user_id'],
					where: {
						user_id: user.id,
					}
				})
			});


			const payload = {
				username: user.username,
				image: marker.dataValues.media[0].path,

			};

			followers.forEach((follower) => {
				const subscription = follower.subscription;
				webPush.sendNotification(subscription, JSON.stringify(payload));
			});
		} catch (error) {
			await errorLogger.log(error, req);
			console.log(error);
		}

	}
}


export default new MarkersController();
