import path from 'path';
import dotenv from 'dotenv';
import url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

dotenv.config({
	path: path.resolve(__dirname, '.env.test')
});