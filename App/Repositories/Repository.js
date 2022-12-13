export default class Repository {

	constructor() {
		if (!this.constructor.model) {
			throw new TypeError('Most define model');
		}

		this.model = this.constructor.model;
	}

	async create(data) {
		const model = new this.model();

		for (let key in data) {
			model.set(key, data[key]);
		}

		await model.save();

		return model;
	}

	async update(model, data) {
		for (let key in data) {
			model.set(key, data[key]);
		}

		await model.save();

		return model;
	}
};
