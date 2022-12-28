'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.createTable('users', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: DataTypes.INTEGER.UNSIGNED
			},
			username: {
				allowNull: false,
				type: DataTypes.STRING
			},
			email: {
				allowNull: false,
				type: DataTypes.STRING
			},
			password: {
				allowNull: false,
				type: DataTypes.STRING
			},
			created_at: {
				allowNull: false,
				type: 'timestamp',
			},
			updated_at: {
				allowNull: false,
				type: 'timestamp'
			}
		});
	},

	async down(queryInterface) {
		await queryInterface.dropTable('Users');
	}
};
