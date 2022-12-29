import {Model, DataTypes} from 'sequelize';
import sequelize from "../../database/sequelize.js";

class Story extends Model {

	static associate(models) {
		Story.belongsTo(models.User,{
			foreignKey: 'user_id'
		});
		Story.hasMany(models.Marker,{
			foreignKey: 'story_id'
		});
	}
}

Story.init({
	user_id: DataTypes.INTEGER.UNSIGNED,
	name: DataTypes.STRING,
	published: DataTypes.BOOLEAN
}, {
	sequelize,
	modelName: 'Story',
	createdAt: 'created_at',
	updatedAt: 'updated_at',
	tableName: 'stories'
});

export default Story;