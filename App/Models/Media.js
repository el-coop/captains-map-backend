import {Model, DataTypes} from 'sequelize';
import sequelize from "../../database/sequelize.js";

class Media extends Model {
	/**
	 * Helper method for defining associations.
	 * This method is not a part of Sequelize lifecycle.
	 * The `models/index` file will call this method automatically.
	 */
	static associate(models) {
		Media.belongsTo(models.Marker,{
			foreignKey: 'marker_id',
			as: 'marker'
		})
	}
}

Media.init({
	marker_id: DataTypes.INTEGER,
	type: DataTypes.STRING,
	instagram_type: DataTypes.STRING,
	path: DataTypes.STRING
}, {
	sequelize,
	modelName: 'Media',
	createdAt: 'created_at',
	updatedAt: 'updated_at',
	tableName: 'medias'
});

export default Media;