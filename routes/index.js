import express from 'express';
import markerRoutes from './marker.js';
import mediaRoutes from './media.js';
import authRoutes from './auth.js';
import bioRoutes from './bio.js';
import storyRoutes from './story.js';
import geocodeRoutes from './geocode.js';
import searchRoutes from './search.js';
import crawlerRoutes from './crawler.js';
import followRoutes from './follow.js';
import errorRoutes from './errors.js';
const router = express.Router();

router.get('/getCsrf', (req, res) => {
	return res.send({});
});

router.use('/', mediaRoutes);
router.use('/auth', authRoutes);
router.use('/marker', markerRoutes);
router.use('/bio', bioRoutes);
router.use('/story', storyRoutes);
router.use('/geocode', geocodeRoutes);

router.use('/search', searchRoutes);
router.use('/crawler', crawlerRoutes);
router.use('/follow', followRoutes);

router.use('/errors',errorRoutes);


export default router;
