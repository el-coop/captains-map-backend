const router = require('express').Router();

router.use('/', require('./media'));
router.use('/auth', require('./auth'));
router.use('/marker', require('./marker'));
router.use('/geocode', require('./geocode'));

router.use('/search', require('./search'));
router.use('/crawler', require('./crawler'));

module.exports = router;