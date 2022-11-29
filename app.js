import express from 'express';
import 'express-async-errors';
import nunjucks from 'nunjucks';
import dotenv from 'dotenv';

import routes from './routes/index.js';

dotenv.config();
const app = express();

import kernelModule from './App/Http/Kernel.js';
const kernel = kernelModule.boot(app);

app.set('port', process.env.PORT || 3000);
nunjucks.configure('views', {
	autoescape: true,
	express: app
});

kernel.registerPreMiddleware();


app.use('/api', routes);

kernel.registerPostMiddleware();

export default app;
