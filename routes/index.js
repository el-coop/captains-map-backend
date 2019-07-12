const router = require('express').Router();

router.get('/getCsrf',(req, res) => {
	return res.send({});
});

router.use('/', require('./media'));
router.use('/auth', require('./auth'));
router.use('/marker', require('./marker'));
router.use('/bio', require('./bio'));
router.use('/geocode', require('./geocode'));

router.use('/search', require('./search'));
router.use('/crawler', require('./crawler'));



module.exports = router;
