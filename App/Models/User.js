import {Model, DataTypes} from 'sequelize';
import sequelize from "../../database/sequelize.js";
import bcrypt from 'bcrypt';

const saltRounds = 12;

async function hashPassword(user) {
	if (user.changed('password')) {
		user.password = await bcrypt.hash(user.password, saltRounds);
	}
}

class User extends Model {
}

User.init({
	username: DataTypes.STRING,
	email: DataTypes.STRING,
	password: DataTypes.STRING
}, {
	hooks: {
		beforeCreate: hashPassword,
		beforeUpdate: hashPassword,
	},
	sequelize,
	modelName: 'User',
	createdAt: 'created_at',
	updatedAt: 'updated_at',
	tableName: 'users'
});

export default User;