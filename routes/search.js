const router = require('express').Router();
const authMiddleware = require('../App/Http/Middleware/AuthMiddleware');
const SearchController = require("../App/Http/Controllers/SearchController");

router.get('/users/:query', authMiddleware, SearchController.users);

module.exports = router;