import express from 'express';
const router = express.Router();
import authMiddleware from'../App/Http/Middleware/AuthMiddleware.js';
import SearchController from"../App/Http/Controllers/SearchController.js";

router.get('/users/:query', authMiddleware, SearchController.users);

export default router;