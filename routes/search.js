const router = require('express').Router();
const authMiddleware = require('../App/Http/middleware/AuthMiddleware');
const SearchController = require("../App/Http/controllers/SearchController");

router.get('/users/:query', authMiddleware, SearchController.users);

module.exports = router;