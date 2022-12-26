'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.createTable('users', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: DataTypes.INTEGER
			},
			username: {
				type: DataTypes.STRING
			},
			email: {
				type: DataTypes.STRING
			},
			password: {
				type: DataTypes.STRING
			},
			created_at: {
				allowNull: false,
				type: DataTypes.DATE
			},
			updated_at: {
				allowNull: false,
				type: DataTypes.DATE
			}
		});
	},

	async down(queryInterface) {
		await queryInterface.dropTable('Users');
	}
};
