import Repository from './Repository.js';
import Story from '../Models/Story.js';

class StoryRepository extends Repository {

	static model = Story;

}

export default new StoryRepository();
