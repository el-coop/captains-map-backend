const Repository = require('./Repository');
const Story = require('../Models/Story');

class StoryRepository extends Repository {

	static model = Story;

}

module.exports = new StoryRepository();
