import {Model, DataTypes} from 'sequelize';
import sequelize from "../../database/sequelize.js";

class Follower extends Model {
	static associate(models) {
		this.belongsTo(models.User,{
			foreignKey: 'user_id',
			as: 'user'
		});
	}
}

Follower.init({
	user_id: DataTypes.INTEGER,
	endpoint: DataTypes.STRING,
	subscription: DataTypes.JSON
}, {
	sequelize,
	modelName: 'Follower',
	createdAt: 'created_at',
	updatedAt: 'updated_at',
	tableName: 'followers'
});

export default Follower;