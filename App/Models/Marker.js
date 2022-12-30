import {Model, DataTypes} from 'sequelize';
import sequelize from "../../database/sequelize.js";

class Marker extends Model {
	static associate(models) {
		Marker.belongsTo(models.User, {
			foreignKey: 'user_id'
		});
		Marker.belongsTo(models.Story, {
			foreignKey: 'story_id'
		});
		Marker.hasMany(models.Media, {
			foreignKey: 'marker_id'
		});
	}
}

Marker.init({
	user_id: DataTypes.INTEGER.UNSIGNED,
	story_id: DataTypes.INTEGER.UNSIGNED,
	lat: DataTypes.DOUBLE,
	lng: DataTypes.DOUBLE,
	type: DataTypes.STRING,
	location: DataTypes.STRING,
	time: DataTypes.DATE,
	description: DataTypes.TEXT
}, {
	sequelize,
	modelName: 'Marker',
	createdAt: 'created_at',
	updatedAt: 'updated_at',
	tableName: 'markers'
});

export default Marker;