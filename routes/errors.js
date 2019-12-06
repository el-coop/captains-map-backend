const errorLogger = require("../App/Services/ErrorLogger");
const router = require('express').Router();

router.post('/', function (req, res) {
	res.sendStatus(200);
	errorLogger.clientLog(req);
});

module.exports = router;
