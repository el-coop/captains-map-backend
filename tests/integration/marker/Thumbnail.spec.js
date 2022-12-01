import test from 'ava';
import app from '../../../app.js';
import request from 'supertest';
import path from 'path';
import fs from 'fs';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const src = path.resolve(__dirname, '../../demo.jpg');

test.serial('It returns 404 for non existing thumbnails without origin image', async t => {
	const response = await request(app).get('/api/thumbnails/demo.jpg');

	t.is(response.status, 404);
	t.is(response.body.error, 'Not Found');
});

test.serial('It returns thumbnails when the thumbnail already exists', async t => {
	const thumbnailPath = path.resolve(__dirname, '../../../public/thumbnails/demo.jpg');

	fs.copyFileSync(src, thumbnailPath);

	const response = await request(app).get('/api/thumbnails/demo.jpg');

	t.is(response.status, 200);
	t.true(response.body instanceof Buffer);


	fs.unlinkSync(thumbnailPath);
});


test.serial('It returns thumbnails when the image is in the images directory', async t => {
	const imagePath = path.resolve(__dirname, '../../../public/images/demo.jpg');
	const thumbnailPath = path.resolve(__dirname, '../../../public/thumbnails/demo.jpg');

	fs.copyFileSync(src, imagePath);
	const response = await request(app).get('/api/thumbnails/demo.jpg');

	t.is(response.status, 200);
	t.true(response.body instanceof Buffer);
	fs.unlinkSync(imagePath);
	fs.unlinkSync(thumbnailPath);
});