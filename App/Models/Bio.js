import {Model, DataTypes} from 'sequelize';
import sequelize from "../../database/sequelize.js";

class Bio extends Model {
	/**
	 * Helper method for defining associations.
	 * This method is not a part of Sequelize lifecycle.
	 * The `models/index` file will call this method automatically.
	 */
	static associate(models) {
		Bio.belongsTo(models.User,{
			foreignKey: 'user_id',
			as: 'user'
		});
	}
}

Bio.init({
	user_id: DataTypes.INTEGER,
	path: DataTypes.STRING,
	description: DataTypes.TEXT
}, {

	sequelize,
	modelName: 'Bio',
	createdAt: 'created_at',
	updatedAt: 'updated_at',
	tableName: 'bios'
});

export default Bio;