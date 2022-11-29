import MakeBase from './BaseClasses/MakeBase.js';
import path from 'path';

class MakeModel extends MakeBase {
	constructor() {
		super();
		this.path = path.resolve(process.cwd(), './App/Models');
		this.stub = 'model';
	}
}

MakeModel.signature = "make:model <name>";
MakeModel.description = "Create a model";

export default MakeModel;
