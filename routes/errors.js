import express from 'express';
const router = express.Router();

import errorLogger from"../App/Services/ErrorLogger.js";

router.post('/', function (req, res) {
	res.sendStatus(200);
	errorLogger.clientLog(req);
});

export default router;
