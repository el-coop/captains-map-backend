import MakeBase from './BaseClasses/MakeBase.js';
import path from 'path';

class MakeMiddleware extends MakeBase {
	constructor() {
		super();
		this.path = path.resolve(process.cwd(), './App/Http/Middleware');
		this.stub = 'middleware';
	}
}

MakeMiddleware.signature = "make:middleware <name>";
MakeMiddleware.description = "Make a new global middleware";

export default MakeMiddleware;
