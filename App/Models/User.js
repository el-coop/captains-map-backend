import {Model, DataTypes} from 'sequelize';
import sequelize from "../../database/sequelize.js";
import bcrypt from 'bcrypt';
import jwtService from '../Services/JwtService.js';

const saltRounds = 12;

async function hashPassword(user) {
	if (user.changed('password')) {
		user.password = await bcrypt.hash(user.password, saltRounds);
	}
}

class User extends Model {
	generateJwt() {
		return jwtService.generate({
			id: this.id,
			username: this.username
		});
	}

	async authenticate(password){
		return await bcrypt.compare(password,this.password)
	}

	static associate(models) {
		User.hasMany(models.Marker,{
			foreignKey: 'user_id',
			as: 'markers',
		});
		User.hasMany(models.Story,{
			foreignKey: 'user_id',
			as: 'stories',
		});
		User.hasMany(models.Follower,{
			foreignKey: 'user_id',
			as: 'followers',
		});
		User.hasOne(models.Bio,{
			foreignKey: 'user_id',
			as: 'bio',
		});
	}

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