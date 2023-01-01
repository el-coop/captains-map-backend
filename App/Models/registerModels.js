import Marker from "./Marker.js";
import Media from "./Media.js";
import User from "./User.js";
import Story from "./Story.js";
import Bio from "./Bio.js";
import Follower from "./Follower.js";

const models = {
	Marker,
	Media,
	User,
	Story,
	Bio,
	Follower
};

for(let model in models){
	models[model].associate(models);
}

export default models;